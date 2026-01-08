import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, satsangEvents, places } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

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
      .select({
        id: sadhaks.id,
        serialNumber: sadhaks.serialNumber,
        placeName: sadhaks.placeName,
        name: sadhaks.name,
        age: sadhaks.age,
        lastHaridwarYear: sadhaks.lastHaridwarYear,
        otherLocation: sadhaks.otherLocation,
        dikshitYear: sadhaks.dikshitYear,
        dikshitBy: sadhaks.dikshitBy,
        isFirstEntry: sadhaks.isFirstEntry,
        relationship: sadhaks.relationship,
      })
      .from(sadhaks)
      .where(eq(sadhaks.eventId, parseInt(eventId)))
      .orderBy(sadhaks.placeName, sadhaks.serialNumber);

    // Group by place
    const groupedByPlace = sadhaksList.reduce((acc, sadhak) => {
      const placeName = sadhak.placeName || 'Unknown';
      if (!acc[placeName]) {
        acc[placeName] = [];
      }
      acc[placeName].push(sadhak);
      return acc;
    }, {} as Record<string, typeof sadhaksList>);

    // Generate ODF content (OpenDocument Text format)
    const odfContent = generateODFContent(event, groupedByPlace);

    return new NextResponse(odfContent, {
      headers: {
        'Content-Type': 'application/vnd.oasis.opendocument.text',
        'Content-Disposition': `attachment; filename="sadhaks-list-${event.eventName}-${new Date().toISOString().split('T')[0]}.odt"`,
      },
    });
  } catch (error) {
    console.error('Error generating ODF:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate ODF',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

function generateODFContent(
  event: any,
  groupedByPlace: Record<string, any[]>
): string {
  const startDate = new Date(event.startDate).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const endDate = new Date(event.endDate).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  let content = `<?xml version="1.0" encoding="UTF-8"?>
<office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                 xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                 xmlns:table="urn:oasis:names:tc:opendocument:xmlns:table:1.0"
                 xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0"
                 xmlns:fo="urn:oasis:names:tc:opendocument:xmlns:xsl-fo-compatible:1.0"
                 office:version="1.2">
  <office:body>
    <office:text>
      <text:p text:style-name="Title">'श्री राम'</text:p>
      <text:p text:style-name="Heading">पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची</text:p>
      <text:p text:style-name="Subtitle">( आप जी की स्वीकृति के लिए )</text:p>
      <text:p></text:p>
      <text:p>भेजने वाले स्थान का नाम : 'श्रीरामशरणम्' पठानकोट</text:p>
      <text:p>साधना सत्संग दिनांक ${startDate} से ${endDate}</text:p>
      <text:p>पता : ${event.organizerAddress || 'डॉ. राजन मैनी, काली माता मंदिर रोड, पठानकोट'}</text:p>
      <text:p>स्थान : ${event.location}</text:p>
      <text:p>दूरभाष : ${event.organizerPhone || '0186-2224242, 9872035936'}</text:p>
      <text:p>ईमेल: ${event.organizerEmail || 'shreeramsharnampathankot@gmail.com'}</text:p>
      <text:p></text:p>
`;

  // Generate tables for each place
  Object.entries(groupedByPlace).forEach(([placeName, sadhaksList]) => {
    content += `
      <text:p text:style-name="Heading2">${placeName}</text:p>
      <table:table table:name="${placeName}">
        <table:table-column table:number-columns-repeated="6"/>
        <table:table-row>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">क्रमांक</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">नाम</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">उम्र</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">अंतिम हरिद्वार</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">किसी भी अन्य स्थान पर</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p text:style-name="Table_Heading">दीक्षित कब और किससे</text:p>
          </table:table-cell>
        </table:table-row>
`;

    sadhaksList.forEach((sadhak) => {
      const nameWithRelation = sadhak.relationship
        ? `${sadhak.name} - (${sadhak.relationship})`
        : sadhak.name;

      const lastHaridwar = sadhak.isFirstEntry
        ? 'प्रथम प्रविष्ट'
        : sadhak.lastHaridwarYear || '-';

      const dikshit = sadhak.dikshitYear
        ? `${sadhak.dikshitYear} –(${sadhak.dikshitBy})`
        : '-';

      content += `
        <table:table-row>
          <table:table-cell>
            <text:p>${sadhak.serialNumber || '-'}</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p>${nameWithRelation}</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p>${sadhak.age || '-'}</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p>${lastHaridwar}</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p>${sadhak.otherLocation || '-'}</text:p>
          </table:table-cell>
          <table:table-cell>
            <text:p>${dikshit}</text:p>
          </table:table-cell>
        </table:table-row>
`;
    });

    content += `
      </table:table>
      <text:p></text:p>
`;
  });

  content += `
      <text:p></text:p>
      <text:p text:style-name="Signature">धन्यवाद</text:p>
    </office:text>
  </office:body>
</office:document>`;

  return content;
}
