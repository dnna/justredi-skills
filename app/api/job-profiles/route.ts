import { NextResponse } from 'next/server';
import { getAllJobProfiles } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const jobProfiles = await getAllJobProfiles(limit, offset);

    return NextResponse.json(jobProfiles);
  } catch (error) {
    console.error('Error fetching job profiles:', error);
    return NextResponse.json({ error: 'Failed to fetch job profiles' }, { status: 500 });
  }
}
