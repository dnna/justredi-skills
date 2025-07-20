import { NextRequest, NextResponse } from 'next/server';
import { getJobProfile } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const jobId = id;

    if (!jobId) {
      return NextResponse.json({ error: 'Job profile ID is required' }, { status: 400 });
    }

    const jobProfile = await getJobProfile(jobId);

    if (!jobProfile) {
      return NextResponse.json({ error: 'Job profile not found' }, { status: 404 });
    }

    return NextResponse.json(jobProfile);
  } catch (error) {
    console.error('Error fetching job profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
