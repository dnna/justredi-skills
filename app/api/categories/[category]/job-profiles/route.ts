import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ category: string }> }) {
  try {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);

    const jobProfiles = await query(
      `
      SELECT 
        id,
        title,
        description,
        hierarchy_level
      FROM job_profiles
      WHERE category = ?
      ORDER BY hierarchy_level, title
    `,
      [decodedCategory]
    );

    return NextResponse.json(jobProfiles);
  } catch (error) {
    console.error('Error fetching job profiles by category:', error);
    return NextResponse.json({ error: 'Failed to fetch job profiles' }, { status: 500 });
  }
}
