import { NextRequest, NextResponse } from 'next/server';
import { getSkillsNotInCourse, getSkillsNotInJob } from '@/lib/admin-db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('q') || '';
    const courseId = searchParams.get('courseId');
    const jobId = searchParams.get('jobId');
    const limit = Number(searchParams.get('limit')) || 20;

    if (!courseId && !jobId) {
      return NextResponse.json({ error: 'Either courseId or jobId is required' }, { status: 400 });
    }

    if (courseId && jobId) {
      return NextResponse.json(
        { error: 'Provide either courseId or jobId, not both' },
        { status: 400 }
      );
    }

    let skills;
    if (courseId) {
      skills = await getSkillsNotInCourse(Number(courseId), searchTerm, limit);
    } else {
      skills = await getSkillsNotInJob(Number(jobId), searchTerm, limit);
    }

    return NextResponse.json({
      success: true,
      skills,
    });
  } catch (error) {
    console.error('Error searching skills:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
