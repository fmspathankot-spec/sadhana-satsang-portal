import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, places } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const eventId = searchParams.get('eventId');

    let query = db
      .select({
        id: sadhaks.id,
        serialNumber: sadhaks.serialNumber,
        name: sadhaks.name,
        age: sadhaks.age,
        lastHaridwarYear: sadhaks.lastHaridwarYear,
        otherLocation: sadhaks.otherLocation,
        dikshitYear: sadhaks.dikshitYear,
        dikshitBy: sadhaks.dikshitBy,
        isFirstEntry: sadhaks.isFirstEntry,
        relationship: sadhaks.relationship,
        placeId: sadhaks.placeId,
        placeName: places.name,
      })
      .from(sadhaks)
      .leftJoin(places, eq(sadhaks.placeId, places.id));

    if (placeId) {
      query = query.where(eq(sadhaks.placeId, parseInt(placeId)));
    }

    const result = await query;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sadhaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sadhaks' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const [sadhak] = await db
      .insert(sadhaks)
      .values(body)
      .returning();

    return NextResponse.json(sadhak, { status: 201 });
  } catch (error) {
    console.error('Error creating sadhak:', error);
    return NextResponse.json(
      { error: 'Failed to create sadhak' },
      { status: 500 }
    );
  }
}