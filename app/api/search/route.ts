import { searchCourses, searchSkills, searchJobProfiles } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const [courses, skills, jobProfiles] = await Promise.all([
      searchCourses(query, 10),
      searchSkills(query, 10),
      searchJobProfiles(query, 10),
    ]);

    return NextResponse.json({ courses, skills, jobProfiles });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
