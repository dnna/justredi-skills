import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = (await query(
      `
      SELECT DISTINCT 
        category as id,
        category as name,
        COUNT(*) as job_count
      FROM job_profiles
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY category
    `,
      []
    )) as Array<{ id: string; name: string; job_count: number }>;

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching job categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}
