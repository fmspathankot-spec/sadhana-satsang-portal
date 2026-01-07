import { NextResponse } from 'next/server';
import { db } from '@/db';
import { places } from '@/db/schema';
import { asc } from 'drizzle-orm';

export async function GET() {
  try {
    const allPlaces = await db
      .select()
      .from(places)
      .orderBy(asc(places.name));

    return NextResponse.json(allPlaces);
  } catch (error) {
    console.error('Error fetching places:', error);
    return NextResponse.json(
      { error: 'Failed to fetch places' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const [place] = await db
      .insert(places)
      .values(body)
      .returning();

    return NextResponse.json(place, { status: 201 });
  } catch (error) {
    console.error('Error creating place:', error);
    return NextResponse.json(
      { error: 'Failed to create place' },
      { status: 500 }
    );
  }
}