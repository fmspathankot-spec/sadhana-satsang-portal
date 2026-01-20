import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks } from '@/db/schema';
import { inArray } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
  try {
    const { ids, isApproved } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Invalid sadhak IDs array' },
        { status: 400 }
      );
    }

    const updatedSadhaks = await db
      .update(sadhaks)
      .set({
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(inArray(sadhaks.id, ids))
      .returning();

    return NextResponse.json({
      success: true,
      count: updatedSadhaks.length,
      sadhaks: updatedSadhaks,
    });
  } catch (error) {
    console.error('Error bulk updating sadhak approvals:', error);
    return NextResponse.json(
      { error: 'Failed to bulk update sadhak approvals' },
      { status: 500 }
    );
  }
}