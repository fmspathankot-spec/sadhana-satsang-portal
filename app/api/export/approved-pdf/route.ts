import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, events } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Fetch event details
    const [eventData] = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(eventId)));

    if (!eventData) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Fetch approved sadhaks for this event
    const approvedSadhaks = await db
      .select()
      .from(sadhaks)
      .where(
        and(
          eq(sadhaks.eventId, parseInt(eventId)),
          eq(sadhaks.isApproved, true)
        )
      );

    if (approvedSadhaks.length === 0) {
      return NextResponse.json(
        { error: 'No approved sadhaks found for this event' },
        { status: 404 }
      );
    }

    // Group by place and gender
    const groupedByPlace: Record<string, { male: any[]; female: any[] }> = {};
    
    approvedSadhaks.forEach((sadhak) => {
      const place = sadhak.placeName || 'Unknown';
      if (!groupedByPlace[place]) {
        groupedByPlace[place] = { male: [], female: [] };
      }
      
      if (sadhak.gender === 'male') {
        groupedByPlace[place].male.push(sadhak);
      } else if (sadhak.gender === 'female') {
        groupedByPlace[place].female.push(sadhak);
      }
    });

    // Format dates
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('hi-IN', { month: 'long' });
      return `${day} ${month}`;
    };

    const startDate = formatDate(eventData.startDate);
    const endDate = formatDate(eventData.endDate);
    const dateRange = `${startDate} - ${endDate}`;

    // Generate HTML
    const html = `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>स्वीकृत नामों की सूची - ${eventData.location}</title>
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans Devanagari', 'Arial', sans-serif;
      font-size: 11pt;
      line-height: 1.4;
      color: #000;
    }
    
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #333;
    }
    
    .header h1 {
      font-size: 18pt;
      font-weight: bold;
      margin-bottom: 8px;
      color: #2d5016;
    }
    
    .header h2 {
      font-size: 14pt;
      font-weight: 600;
      color: #444;
    }
    
    .place-section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }
    
    .place-header {
      text-align: center;
      font-size: 13pt;
      font-weight: bold;
      margin-bottom: 12px;
      padding: 8px;
      background-color: #f0f0f0;
      border-radius: 4px;
    }
    
    .gender-section {
      margin-bottom: 15px;
    }
    
    .gender-title {
      font-size: 12pt;
      font-weight: bold;
      margin-bottom: 8px;
      padding: 5px 10px;
      border-radius: 3px;
    }
    
    .gender-title.female {
      background-color: #ffc0cb;
      color: #000;
    }
    
    .gender-title.male {
      background-color: #add8e6;
      color: #000;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    th, td {
      border: 1px solid #333;
      padding: 8px;
      text-align: left;
    }
    
    th {
      font-weight: bold;
      font-size: 10pt;
    }
    
    thead.female th {
      background-color: #ffc0cb;
    }
    
    thead.male th {
      background-color: #add8e6;
    }
    
    td {
      font-size: 10pt;
    }
    
    .col-sn {
      width: 60px;
      text-align: center;
    }
    
    .col-name {
      width: auto;
    }
    
    .col-age {
      width: 60px;
      text-align: center;
    }
    
    .col-phone {
      width: 110px;
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
    <h1>स्वीकृत नामों की सूची</h1>
    <h2>${eventData.location} साधना सत्संग (${dateRange})</h2>
  </div>

  ${Object.entries(groupedByPlace).map(([place, { male, female }]) => `
    <div class="place-section">
      <div class="place-header">${place} (${dateRange})</div>
      
      ${female.length > 0 ? `
        <div class="gender-section">
          <div class="gender-title female">महिलाएं (Ladies)</div>
          <table>
            <thead class="female">
              <tr>
                <th class="col-sn">क्रमांक</th>
                <th class="col-name">नाम</th>
                <th class="col-age">उम्र</th>
                <th class="col-phone">मोबाइल नंबर</th>
              </tr>
            </thead>
            <tbody>
              ${female.map((s, idx) => `
                <tr>
                  <td class="col-sn">${idx + 1}</td>
                  <td class="col-name">${s.name}</td>
                  <td class="col-age">${s.age || '-'}</td>
                  <td class="col-phone">${s.phone || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
      
      ${male.length > 0 ? `
        <div class="gender-section">
          <div class="gender-title male">पुरुष (Gents)</div>
          <table>
            <thead class="male">
              <tr>
                <th class="col-sn">क्रमांक</th>
                <th class="col-name">नाम</th>
                <th class="col-age">उम्र</th>
                <th class="col-phone">मोबाइल नंबर</th>
              </tr>
            </thead>
            <tbody>
              ${male.map((s, idx) => `
                <tr>
                  <td class="col-sn">${idx + 1}</td>
                  <td class="col-name">${s.name}</td>
                  <td class="col-age">${s.age || '-'}</td>
                  <td class="col-phone">${s.phone || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
    </div>
  `).join('')}
</body>
</html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    await browser.close();

    // Generate filename
    const locationName = eventData.location.replace(/\s+/g, '_');
    const startDateObj = new Date(eventData.startDate);
    const endDateObj = new Date(eventData.endDate);
    const dateStr = `${startDateObj.getDate()}-${endDateObj.getDate()}_${startDateObj.toLocaleDateString('en', { month: 'short' })}`;
    const filename = `Swikrit_${locationName}_${dateStr}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}