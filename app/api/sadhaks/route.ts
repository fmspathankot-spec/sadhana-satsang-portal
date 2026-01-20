import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks, places } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const eventId = searchParams.get('eventId');

    console.log('GET /api/sadhaks - placeId:', placeId, 'eventId:', eventId);

    let query = db
      .select({
        id: sadhaks.id,
        serialNumber: sadhaks.serialNumber,
        placeName: sadhaks.placeName,
        name: sadhaks.name,
        gender: sadhaks.gender,
        phone: sadhaks.phone,
        age: sadhaks.age,
        lastHaridwarYear: sadhaks.lastHaridwarYear,
        otherLocation: sadhaks.otherLocation,
        dikshitYear: sadhaks.dikshitYear,
        dikshitBy: sadhaks.dikshitBy,
        isFirstEntry: sadhaks.isFirstEntry,
        relationship: sadhaks.relationship,
        placeId: sadhaks.placeId,
        eventId: sadhaks.eventId,
        isApproved: sadhaks.isApproved,
        approvedAt: sadhaks.approvedAt,
      })
      .from(sadhaks)
      .leftJoin(places, eq(sadhaks.placeId, places.id));

    const conditions = [];
    if (placeId) {
      conditions.push(eq(sadhaks.placeId, parseInt(placeId)));
    }
    if (eventId) {
      conditions.push(eq(sadhaks.eventId, parseInt(eventId)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const result = await query;
    console.log('Found sadhaks:', result.length);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching sadhaks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sadhaks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST /api/sadhaks - Received data:', body);

    // Validate required fields (placeId is now optional/nullable)
    if (!body.placeName || body.placeName.trim() === '') {
      return NextResponse.json(
        { error: 'placeName is required' },
        { status: 400 }
      );
    }

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    if (!body.gender || !['male', 'female'].includes(body.gender)) {
      return NextResponse.json(
        { error: 'gender is required and must be male or female' },
        { status: 400 }
      );
    }

    // Insert into database
    const [sadhak] = await db
      .insert(sadhaks)
      .values({
        placeId: body.placeId || null, // Now nullable
        eventId: body.eventId || null,
        serialNumber: body.serialNumber || null,
        placeName: body.placeName,
        name: body.name,
        gender: body.gender,
        phone: body.phone || null,
        age: body.age || null,
        lastHaridwarYear: body.lastHaridwarYear || null,
        otherLocation: body.otherLocation || null,
        dikshitYear: body.dikshitYear || null,
        dikshitBy: body.dikshitBy || 'डॉ. श्री विश्वामित्र जी महाराज',
        isFirstEntry: body.isFirstEntry || false,
        relationship: body.relationship || null,
        isApproved: false, // Default to not approved
        approvedAt: null,
      })
      .returning();

    console.log('Created sadhak:', sadhak);

    return NextResponse.json(sadhak, { status: 201 });
  } catch (error) {
    console.error('Error creating sadhak:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create sadhak', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}