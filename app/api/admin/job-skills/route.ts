import { NextRequest, NextResponse } from 'next/server';
import {
  createJobSkillAssignment,
  updateJobSkillAssignment,
  deleteJobSkillAssignment,
  getJobSkillAssignments,
} from '@/lib/admin-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, skillId, is_essential, skill_level } = body;

    if (!jobId || !skillId) {
      return NextResponse.json({ error: 'Job ID and Skill ID are required' }, { status: 400 });
    }

    const validSkillLevels = ['basic', 'intermediate', 'advanced'];
    if (skill_level && !validSkillLevels.includes(skill_level)) {
      return NextResponse.json(
        { error: 'Skill level must be one of: basic, intermediate, advanced' },
        { status: 400 }
      );
    }

    const result = await createJobSkillAssignment(Number(jobId), Number(skillId), {
      is_essential,
      skill_level,
    });

    return NextResponse.json({
      success: true,
      message: 'Skill assigned to job profile successfully',
      result,
    });
  } catch (error) {
    console.error('Error creating job-skill assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, skillId, is_essential, skill_level } = body;

    if (!jobId || !skillId) {
      return NextResponse.json({ error: 'Job ID and Skill ID are required' }, { status: 400 });
    }

    const validSkillLevels = ['basic', 'intermediate', 'advanced'];
    if (skill_level && !validSkillLevels.includes(skill_level)) {
      return NextResponse.json(
        { error: 'Skill level must be one of: basic, intermediate, advanced' },
        { status: 400 }
      );
    }

    const result = await updateJobSkillAssignment(Number(jobId), Number(skillId), {
      is_essential,
      skill_level,
    });

    return NextResponse.json({
      success: true,
      message: 'Job-skill assignment updated successfully',
      result,
    });
  } catch (error) {
    console.error('Error updating job-skill assignment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const skillId = searchParams.get('skillId');

    if (!jobId || !skillId) {
      return NextResponse.json({ error: 'Job ID and Skill ID are required' }, { status: 400 });
    }

    const result = await deleteJobSkillAssignment(Number(jobId), Number(skillId));

    return NextResponse.json({
      success: true,
      message: 'Skill removed from job profile successfully',
      result,
    });
  } catch (error) {
    console.error('Error deleting job-skill assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const assignments = await getJobSkillAssignments(Number(jobId));

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching job-skill assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
