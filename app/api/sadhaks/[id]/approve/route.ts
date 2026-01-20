import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const { isApproved } = await request.json();

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid sadhak ID' },
        { status: 400 }
      );
    }

    const updatedSadhak = await db
      .update(sadhaks)
      .set({
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(sadhaks.id, id))
      .returning();

    if (updatedSadhak.length === 0) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSadhak[0]);
  } catch (error) {
    console.error('Error updating sadhak approval:', error);
    return NextResponse.json(
      { error: 'Failed to update sadhak approval' },
      { status: 500 }
    );
  }
}