import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    console.log('PUT /api/sadhaks/[id] - ID:', id, 'Data:', body);

    // Validate required fields
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

    // Update sadhak
    const [updatedSadhak] = await db
      .update(sadhaks)
      .set({
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
        updatedAt: new Date(),
      })
      .where(eq(sadhaks.id, id))
      .returning();

    if (!updatedSadhak) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    console.log('Updated sadhak:', updatedSadhak);

    return NextResponse.json(updatedSadhak);
  } catch (error) {
    console.error('Error updating sadhak:', error);
    return NextResponse.json(
      {
        error: 'Failed to update sadhak',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    console.log('DELETE /api/sadhaks/[id] - ID:', id);

    const [deletedSadhak] = await db
      .delete(sadhaks)
      .where(eq(sadhaks.id, id))
      .returning();

    if (!deletedSadhak) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    console.log('Deleted sadhak:', deletedSadhak);

    return NextResponse.json({ success: true, sadhak: deletedSadhak });
  } catch (error) {
    console.error('Error deleting sadhak:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete sadhak',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}