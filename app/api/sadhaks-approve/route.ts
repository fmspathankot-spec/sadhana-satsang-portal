import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Single sadhak approval
export async function PATCH(request: NextRequest) {
  try {
    const { id, isApproved } = await request.json();

    if (!id || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request: id and isApproved are required' },
        { status: 400 }
      );
    }

    // Update approval status
    const [updated] = await db
      .update(sadhaks)
      .set({
        isApproved,
        approvedAt: isApproved ? new Date() : null,
      })
      .where(eq(sadhaks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      sadhak: updated,
    });
  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json(
      { error: 'Failed to update approval status' },
      { status: 500 }
    );
  }
}