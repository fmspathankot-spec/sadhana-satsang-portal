import { NextResponse } from 'next/server';
import { db } from '@/db';
import { satsangEvents } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('eventType');

    console.log('GET /api/events - eventType:', eventType);

    // Map frontend event types to database event types
    let dbEventType = eventType;
    if (eventType === 'khula') {
      dbEventType = 'khule_satsang';
    } else if (eventType === 'sadhna') {
      dbEventType = 'sadhna';
    }

    console.log('Mapped to dbEventType:', dbEventType);

    let query = db.select().from(satsangEvents).orderBy(desc(satsangEvents.startDate));

    if (dbEventType) {
      query = query.where(
        and(
          eq(satsangEvents.eventType, dbEventType),
          eq(satsangEvents.isActive, true)
        )
      );
    } else {
      query = query.where(eq(satsangEvents.isActive, true));
    }

    const events = await query;
    console.log('Found events:', events.length);

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/events - Received data:', body);

    const [event] = await db
      .insert(satsangEvents)
      .values({
        eventType: body.eventType || 'साधना',
        eventName: body.eventName,
        startDate: body.startDate,
        endDate: body.endDate,
        location: body.location,
        organizerName: body.organizerName || null,
        organizerAddress: body.organizerAddress || null,
        organizerPhone: body.organizerPhone || null,
        organizerEmail: body.organizerEmail || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
      })
      .returning();

    console.log('Created event:', event);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}