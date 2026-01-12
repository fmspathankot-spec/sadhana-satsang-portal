import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, satsangEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import PDFDocument from 'pdfkit';

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
    const doc = new PDFDocument({ 
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));

    // Register Devanagari font (you'll need to add this font file)
    // For now, using default font
    doc.font('Helvetica');

    // Header
    doc.fontSize(16).text("'श्री राम'", { align: 'center' });
    doc.moveDown(0.5);
    
    doc.fontSize(14).text(
      `पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची`,
      { align: 'center' }
    );
    doc.moveDown(0.3);
    
    doc.fontSize(10).text(
      `( आप जी की स्वीकृति के लिए )`,
      { align: 'center' }
    );
    doc.moveDown(1);

    // Event details - Left side
    const leftX = 50;
    const rightX = 350;
    let currentY = doc.y;

    doc.fontSize(9);
    doc.text(`भेजने वाले स्थान का नाम : 'श्रीरामशरणम्' पठानकोट`, leftX, currentY, { width: 300 });
    doc.text(`साधना सत्संग दिनांक ${startDate} से ${endDate}`, rightX, currentY, { width: 200 });
    
    currentY += 15;
    doc.text(`पता : डॉ० राजन मैनी, काली माता मंदिर रोड, पठानकोट`, leftX, currentY, { width: 300 });
    doc.text(`स्थान : ${event.location}`, rightX, currentY, { width: 200 });
    
    currentY += 15;
    doc.text(`दूरभाष : 0186-2224242, 9872035936`, leftX, currentY, { width: 300 });
    doc.text(`ईमेल: shreeramsharnampathankot@gmail.com`, rightX, currentY, { width: 200 });

    doc.moveDown(2);

    // Tables for each place
    Object.entries(groupedByPlace).forEach(([placeName, sadhaksList], placeIndex) => {
      if (placeIndex > 0) {
        doc.addPage();
      }

      // Place name header
      doc.fontSize(14).text(placeName, { align: 'center', underline: true });
      doc.moveDown(1);

      // Table headers
      const tableTop = doc.y;
      const colWidths = [60, 150, 50, 80, 100, 200];
      const headers = ['क्रमांक', 'नाम', 'उम्र', 'अंतिम\nहरिद्वार', 'किसी भी अन्य\nस्थान पर', 'दीक्षित कब और किससे'];
      
      let currentX = 50;
      doc.fontSize(9);
      
      // Draw header row
      headers.forEach((header, i) => {
        doc.rect(currentX, tableTop, colWidths[i], 30).stroke();
        doc.text(header, currentX + 5, tableTop + 8, { 
          width: colWidths[i] - 10,
          align: 'center'
        });
        currentX += colWidths[i];
      });

      // Draw data rows
      let rowY = tableTop + 30;
      sadhaksList.forEach((sadhak) => {
        currentX = 50;
        const rowHeight = 25;

        // Format name with relationship
        let displayName = sadhak.name;
        if (sadhak.relationship) {
          displayName += ` - (${sadhak.relationship})`;
        }

        // Format last Haridwar
        const lastHaridwar = sadhak.isFirstEntry 
          ? 'प्रथम\nप्रविष्ट' 
          : sadhak.lastHaridwarYear?.toString() || '-';

        // Format dikshit info
        const dikshitInfo = sadhak.dikshitYear 
          ? `${sadhak.dikshitYear} –(${sadhak.dikshitBy})`
          : `(${sadhak.dikshitBy})`;

        const rowData = [
          sadhak.serialNumber?.toString() || '-',
          displayName,
          sadhak.age?.toString() || '-',
          lastHaridwar,
          sadhak.otherLocation || '-',
          dikshitInfo
        ];

        // Draw cells
        rowData.forEach((data, i) => {
          doc.rect(currentX, rowY, colWidths[i], rowHeight).stroke();
          doc.text(data, currentX + 5, rowY + 5, {
            width: colWidths[i] - 10,
            align: i === 0 ? 'center' : 'left'
          });
          currentX += colWidths[i];
        });

        rowY += rowHeight;

        // Add new page if needed
        if (rowY > 700) {
          doc.addPage();
          rowY = 50;
        }
      });

      doc.moveDown(2);
    });

    // Footer
    doc.addPage();
    doc.fontSize(14).text('धन्यवाद', { align: 'center' });

    doc.end();

    // Wait for PDF to finish
    await new Promise((resolve) => {
      doc.on('end', resolve);
    });

    const pdfBuffer = Buffer.concat(chunks);

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