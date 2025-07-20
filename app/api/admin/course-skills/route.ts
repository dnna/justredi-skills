import { NextRequest, NextResponse } from 'next/server';
import {
  createCourseSkillAssignment,
  updateCourseSkillAssignment,
  deleteCourseSkillAssignment,
  getCourseSkillAssignments,
} from '@/lib/admin-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, skillId, retrieval_score, rerank_score } = body;

    if (!courseId || !skillId) {
      return NextResponse.json({ error: 'Course ID and Skill ID are required' }, { status: 400 });
    }

    if (retrieval_score !== undefined && (retrieval_score < 0 || retrieval_score > 1)) {
      return NextResponse.json(
        { error: 'Retrieval score must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (rerank_score !== undefined && (rerank_score < 0 || rerank_score > 1)) {
      return NextResponse.json({ error: 'Rerank score must be between 0 and 1' }, { status: 400 });
    }

    const result = await createCourseSkillAssignment(Number(courseId), Number(skillId), {
      retrieval_score,
      rerank_score,
    });

    return NextResponse.json({
      success: true,
      message: 'Skill assigned to course successfully',
      result,
    });
  } catch (error) {
    console.error('Error creating course-skill assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, skillId, retrieval_score, rerank_score } = body;

    if (!courseId || !skillId) {
      return NextResponse.json({ error: 'Course ID and Skill ID are required' }, { status: 400 });
    }

    if (retrieval_score !== undefined && (retrieval_score < 0 || retrieval_score > 1)) {
      return NextResponse.json(
        { error: 'Retrieval score must be between 0 and 1' },
        { status: 400 }
      );
    }

    if (rerank_score !== undefined && (rerank_score < 0 || rerank_score > 1)) {
      return NextResponse.json({ error: 'Rerank score must be between 0 and 1' }, { status: 400 });
    }

    const result = await updateCourseSkillAssignment(Number(courseId), Number(skillId), {
      retrieval_score,
      rerank_score,
    });

    return NextResponse.json({
      success: true,
      message: 'Course-skill assignment updated successfully',
      result,
    });
  } catch (error) {
    console.error('Error updating course-skill assignment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const skillId = searchParams.get('skillId');

    if (!courseId || !skillId) {
      return NextResponse.json({ error: 'Course ID and Skill ID are required' }, { status: 400 });
    }

    const result = await deleteCourseSkillAssignment(Number(courseId), Number(skillId));

    return NextResponse.json({
      success: true,
      message: 'Skill removed from course successfully',
      result,
    });
  } catch (error) {
    console.error('Error deleting course-skill assignment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    const assignments = await getCourseSkillAssignments(Number(courseId));

    return NextResponse.json({
      success: true,
      assignments,
    });
  } catch (error) {
    console.error('Error fetching course-skill assignments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
