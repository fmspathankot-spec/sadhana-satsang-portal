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

    // Create HTML content
    let htmlContent = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>साधकों की सूची</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    
    body {
      font-family: 'Noto Sans Devanagari', Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .header h1 {
      font-size: 18pt;
      margin: 10px 0;
    }
    
    .header h2 {
      font-size: 16pt;
      margin: 10px 0;
    }
    
    .header p {
      font-size: 12pt;
      margin: 5px 0;
    }
    
    .event-details {
      font-size: 10pt;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    
    .event-details table {
      width: 100%;
      border-collapse: collapse;
    }
    
    .event-details td {
      padding: 3px 0;
    }
    
    .event-details td:first-child {
      width: 60%;
    }
    
    .place-section {
      page-break-before: always;
      margin-top: 30px;
    }
    
    .place-section:first-of-type {
      page-break-before: auto;
      margin-top: 0;
    }
    
    .place-header {
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin: 20px 0;
      text-decoration: underline;
    }
    
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
      font-size: 10pt;
    }
    
    table.data-table th,
    table.data-table td {
      border: 1px solid #000;
      padding: 8px 5px;
      text-align: left;
    }
    
    table.data-table th {
      background-color: #f5f5f5;
      font-weight: bold;
      text-align: center;
    }
    
    table.data-table td:first-child {
      text-align: center;
      width: 8%;
    }
    
    table.data-table td:nth-child(2) {
      width: 22%;
    }
    
    table.data-table td:nth-child(3) {
      text-align: center;
      width: 8%;
    }
    
    table.data-table td:nth-child(4) {
      text-align: center;
      width: 12%;
    }
    
    table.data-table td:nth-child(5) {
      width: 18%;
    }
    
    table.data-table td:nth-child(6) {
      width: 32%;
    }
    
    .footer {
      page-break-before: always;
      text-align: center;
      font-size: 16pt;
      font-weight: bold;
      margin-top: 100px;
    }
    
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>'श्री राम'</h1>
    <h2>पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची</h2>
    <p>( आप जी की स्वीकृति के लिए )</p>
  </div>
  
  <div class="event-details">
    <table>
      <tr>
        <td>भेजने वाले स्थान का नाम : 'श्रीरामशरणम्' पठानकोट</td>
        <td>साधना सत्संग दिनांक ${startDate} से ${endDate}</td>
      </tr>
      <tr>
        <td>पता : डॉ० राजन मैनी, काली माता मंदिर रोड, पठानकोट</td>
        <td>स्थान : ${event.location}</td>
      </tr>
      <tr>
        <td>दूरभाष : 0186-2224242, 9872035936</td>
        <td>ईमेल: shreeramsharnampathankot@gmail.com</td>
      </tr>
    </table>
  </div>
`;

    // Add tables for each place
    Object.entries(groupedByPlace).forEach(([placeName, sadhaksList]) => {
      htmlContent += `
  <div class="place-section">
    <div class="place-header">${placeName}</div>
    
    <table class="data-table">
      <thead>
        <tr>
          <th>क्रमांक</th>
          <th>नाम</th>
          <th>उम्र</th>
          <th>अंतिम<br>हरिद्वार</th>
          <th>किसी भी अन्य<br>स्थान पर</th>
          <th>दीक्षित कब और किससे</th>
        </tr>
      </thead>
      <tbody>
`;

      sadhaksList.forEach((sadhak) => {
        // Format name with relationship
        let displayName = sadhak.name;
        if (sadhak.relationship) {
          displayName += ` - (${sadhak.relationship})`;
        }

        // Format last Haridwar
        const lastHaridwar = sadhak.isFirstEntry 
          ? 'प्रथम<br>प्रविष्ट' 
          : sadhak.lastHaridwarYear?.toString() || '-';

        // Format dikshit info
        const dikshitInfo = sadhak.dikshitYear 
          ? `${sadhak.dikshitYear} –(${sadhak.dikshitBy})`
          : `(${sadhak.dikshitBy})`;

        htmlContent += `
        <tr>
          <td>${sadhak.serialNumber || '-'}</td>
          <td>${displayName}</td>
          <td>${sadhak.age || '-'}</td>
          <td>${lastHaridwar}</td>
          <td>${sadhak.otherLocation || '-'}</td>
          <td>${dikshitInfo}</td>
        </tr>
`;
      });

      htmlContent += `
      </tbody>
    </table>
  </div>
`;
    });

    // Add footer
    htmlContent += `
  <div class="footer">
    धन्यवाद
  </div>
</body>
</html>
`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Error generating HTML:', error);
    return NextResponse.json(
      { error: 'Failed to generate HTML', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}