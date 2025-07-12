import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { learningPathId } = await request.json();

    if (!learningPathId) {
      return NextResponse.json({ message: 'learningPathId is required' }, { status: 400 });
    }

    const result = await query(
      'UPDATE learning_paths SET view_count = view_count + 1 WHERE id = ?',
      [learningPathId]
    );

    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ message: 'Learning path not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'View count updated' });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
