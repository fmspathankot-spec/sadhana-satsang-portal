import { NextResponse } from 'next/server';
import { db } from '@/db';
import { sadhaks } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    const [sadhak] = await db
      .select()
      .from(sadhaks)
      .where(eq(sadhaks.id, id));

    if (!sadhak) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sadhak);
  } catch (error) {
    console.error('Error fetching sadhak:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sadhak' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();

    console.log('PUT /api/sadhaks/' + id, body);

    const [updated] = await db
      .update(sadhaks)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(sadhaks.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    console.log('Updated sadhak:', updated);
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating sadhak:', error);
    return NextResponse.json(
      { error: 'Failed to update sadhak' },
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

    console.log('DELETE /api/sadhaks/' + id);

    const [deleted] = await db
      .delete(sadhaks)
      .where(eq(sadhaks.id, id))
      .returning();

    if (!deleted) {
      return NextResponse.json(
        { error: 'Sadhak not found' },
        { status: 404 }
      );
    }

    console.log('Deleted sadhak:', deleted);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting sadhak:', error);
    return NextResponse.json(
      { error: 'Failed to delete sadhak' },
      { status: 500 }
    );
  }
}