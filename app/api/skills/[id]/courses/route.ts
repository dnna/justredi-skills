import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const skillId = resolvedParams.id;

  try {
    // Query to get courses that include this skill
    const coursesQuery = `
      SELECT c.id, c.name as courseName, i.name as institutionName, 
             cs.retrieval_score
      FROM courses c
      JOIN course_skills cs ON c.id = cs.course_id
      JOIN institutions i ON c.institution_id = i.id
      WHERE cs.skill_id = ?
      ORDER BY cs.retrieval_score DESC
      LIMIT 10
    `;

    const courses = await query(coursesQuery, [skillId]);

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses for skill:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
