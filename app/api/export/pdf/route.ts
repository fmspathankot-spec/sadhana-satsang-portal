import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, satsangEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: {
      finalY: number;
    };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId is required' },
        { status: 400 }
      );
    }

    // Fetch event details
    const [event] = await db
      .select()
      .from(satsangEvents)
      .where(eq(satsangEvents.id, parseInt(eventId)));

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch sadhaks for this event
    const sadhaksList = await db
      .select()
      .from(sadhaks)
      .where(eq(sadhaks.eventId, parseInt(eventId)))
      .orderBy(sadhaks.placeName, sadhaks.serialNumber);

    // Group by place
    const groupedByPlace: Record<string, typeof sadhaksList> = {};
    sadhaksList.forEach((sadhak) => {
      if (!groupedByPlace[sadhak.placeName]) {
        groupedByPlace[sadhak.placeName] = [];
      }
      groupedByPlace[sadhak.placeName].push(sadhak);
    });

    // Format dates
    const startDate = new Date(event.startDate).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const endDate = new Date(event.endDate).toLocaleDateString('hi-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Create PDF
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Header
    doc.setFontSize(16);
    doc.text("'श्री राम'", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text(
      'पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची',
      doc.internal.pageSize.getWidth() / 2,
      30,
      { align: 'center' }
    );
    
    doc.setFontSize(10);
    doc.text(
      '( आप जी की स्वीकृति के लिए )',
      doc.internal.pageSize.getWidth() / 2,
      37,
      { align: 'center' }
    );

    // Event details
    doc.setFontSize(9);
    let yPos = 45;
    
    doc.text(`भेजने वाले स्थान का नाम : 'श्रीरामशरणम्' पठानकोट`, 15, yPos);
    doc.text(`साधना सत्संग दिनांक ${startDate} से ${endDate}`, 120, yPos);
    
    yPos += 5;
    doc.text('पता : डॉ० राजन मैनी, काली माता मंदिर रोड, पठानकोट', 15, yPos);
    doc.text(`स्थान : ${event.location}`, 120, yPos);
    
    yPos += 5;
    doc.text('दूरभाष : 0186-2224242, 9872035936', 15, yPos);
    doc.text('ईमेल: shreeramsharnampathankot@gmail.com', 120, yPos);

    yPos += 10;

    // Tables for each place
    Object.entries(groupedByPlace).forEach(([placeName, sadhaksList], placeIndex) => {
      if (placeIndex > 0) {
        doc.addPage();
        yPos = 20;
      }

      // Place name header
      doc.setFontSize(14);
      doc.text(placeName, doc.internal.pageSize.getWidth() / 2, yPos, { align: 'center' });
      yPos += 8;

      // Prepare table data
      const tableData = sadhaksList.map((sadhak) => {
        // Format name with relationship
        let displayName = sadhak.name;
        if (sadhak.relationship) {
          displayName += ` - (${sadhak.relationship})`;
        }

        // Format last Haridwar
        const lastHaridwar = sadhak.isFirstEntry 
          ? 'प्रथम प्रविष्ट' 
          : sadhak.lastHaridwarYear?.toString() || '-';

        // Format dikshit info
        const dikshitInfo = sadhak.dikshitYear 
          ? `${sadhak.dikshitYear} –(${sadhak.dikshitBy})`
          : `(${sadhak.dikshitBy})`;

        return [
          sadhak.serialNumber?.toString() || '-',
          displayName,
          sadhak.age?.toString() || '-',
          lastHaridwar,
          sadhak.otherLocation || '-',
          dikshitInfo
        ];
      });

      // Create table
      doc.autoTable({
        startY: yPos,
        head: [[
          'क्रमांक',
          'नाम',
          'उम्र',
          'अंतिम\nहरिद्वार',
          'किसी भी अन्य\nस्थान पर',
          'दीक्षित कब और किससे'
        ]],
        body: tableData,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 3,
          overflow: 'linebreak',
          halign: 'left'
        },
        headStyles: {
          fillColor: [255, 237, 213],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          1: { cellWidth: 40 },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 30 },
          5: { cellWidth: 50 }
        },
        margin: { left: 15, right: 15 }
      });

      yPos = doc.lastAutoTable.finalY + 10;
    });

    // Footer
    doc.addPage();
    doc.setFontSize(14);
    doc.text('धन्यवाद', doc.internal.pageSize.getWidth() / 2, 100, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sadhaks-list-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}