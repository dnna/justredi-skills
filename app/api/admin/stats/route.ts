import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentStats } from '@/lib/admin-db';

export async function GET(request: NextRequest) {
  try {
    const stats = await getAssignmentStats();

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching assignment stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
