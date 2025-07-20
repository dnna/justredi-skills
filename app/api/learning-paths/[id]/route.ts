import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const learningPathId = id;

    if (!learningPathId) {
      return NextResponse.json({ error: 'Learning path ID is required' }, { status: 400 });
    }

    // Get learning path details
    const learningPathQuery = `
      SELECT 
        lp.id,
        lp.name,
        lp.description,
        lp.essential_skills_match_percent,
        lp.total_skills_match_percent,
        lp.score,
        lp.view_count,
        jp.id as job_id,
        jp.title as job_title,
        jp.description as job_description
      FROM learning_paths lp
      JOIN job_profiles jp ON lp.job_id = jp.id
      WHERE lp.id = ?
    `;

    const learningPaths = await query(learningPathQuery, [learningPathId]);
    if (!learningPaths || (learningPaths as any[]).length === 0) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 });
    }

    const learningPath = (learningPaths as any[])[0];

    // Get courses in this learning path
    const coursesQuery = `
      SELECT 
        c.id,
        c.name,
        c.external_url,
        i.name as institution_name,
        i.id as institution_id,
        lpc.sequence_order,
        lpc.is_prerequisite
      FROM learning_path_courses lpc
      JOIN courses c ON lpc.course_id = c.id
      JOIN institutions i ON c.institution_id = i.id
      WHERE lpc.learning_path_id = ?
      ORDER BY lpc.sequence_order
    `;

    const courses = await query(coursesQuery, [learningPathId]);

    // Get skills covered by this learning path
    const skillsQuery = `
      SELECT 
        s.id,
        s.esco_id,
        COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label,
        COALESCE(s.description_el, s.description) as description,
        s.skill_type,
        s.is_digital_skill,
        lpsc.coverage_score,
        js.is_essential,
        js.skill_level
      FROM learning_path_skill_coverage lpsc
      JOIN skills s ON lpsc.skill_id = s.id
      JOIN job_skills js ON s.id = js.skill_id AND js.job_id = ?
      WHERE lpsc.learning_path_id = ?
      ORDER BY js.is_essential DESC, s.preferred_label
    `;

    const skills = await query(skillsQuery, [learningPath.job_id, learningPathId]);

    // Update view count
    await query('UPDATE learning_paths SET view_count = view_count + 1 WHERE id = ?', [
      learningPathId,
    ]);

    return NextResponse.json({
      ...learningPath,
      courses: courses || [],
      skills: skills || [],
    });
  } catch (error) {
    console.error('Error fetching learning path:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
