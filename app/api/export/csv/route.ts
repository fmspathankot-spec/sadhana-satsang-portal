import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, satsangEvents } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Create CSV content
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility

    // Header
    csvContent += `'श्री राम'\n\n`;
    csvContent += `पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची\n`;
    csvContent += `( आप जी की स्वीकृति के लिए )\n\n`;
    
    // Event details
    csvContent += `भेजने वाले स्थान का नाम : 'श्रीरामशरणम्' पठानकोट,साधना सत्संग दिनांक ${startDate} से ${endDate}\n`;
    csvContent += `पता : डॉ० राजन मैनी काली माता मंदिर रोड पठानकोट,स्थान : ${event.location}\n`;
    csvContent += `दूरभाष : 0186-2224242 9872035936,ईमेल: shreeramsharnampathankot@gmail.com\n\n`;

    // Tables for each place
    Object.entries(groupedByPlace).forEach(([placeName, sadhaksList]) => {
      csvContent += `\n${placeName}\n`;
      
      // Table headers
      csvContent += `क्रमांक,नाम,उम्र,अंतिम हरिद्वार,किसी भी अन्य स्थान पर,दीक्षित कब और किससे\n`;
      
      // Data rows
      sadhaksList.forEach((sadhak) => {
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

        // Escape commas in fields
        const escapeCSV = (str: string) => {
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        csvContent += `${sadhak.serialNumber || '-'},`;
        csvContent += `${escapeCSV(displayName)},`;
        csvContent += `${sadhak.age || '-'},`;
        csvContent += `${escapeCSV(lastHaridwar)},`;
        csvContent += `${escapeCSV(sadhak.otherLocation || '-')},`;
        csvContent += `${escapeCSV(dikshitInfo)}\n`;
      });
    });

    // Footer
    csvContent += `\nधन्यवाद\n`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="sadhaks-list-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}