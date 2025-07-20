import { NextRequest, NextResponse } from 'next/server';
import { getTopScoringLearningPaths } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get('limit')) || 20;

    if (limit > 100) {
      return NextResponse.json({ error: 'Limit cannot exceed 100' }, { status: 400 });
    }

    const learningPaths = await getTopScoringLearningPaths(limit);

    return NextResponse.json(learningPaths);
  } catch (error) {
    console.error('Error fetching featured learning paths:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
