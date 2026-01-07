import { NextResponse } from 'next/server';
import { db } from '@/db';
import { satsangEvents } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const events = await db
      .select()
      .from(satsangEvents)
      .orderBy(desc(satsangEvents.startDate));

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
    
    const [event] = await db
      .insert(satsangEvents)
      .values(body)
      .returning();

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}