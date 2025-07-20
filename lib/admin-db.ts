import { query } from './db';

export async function createCourseSkillAssignment(
  courseId: number,
  skillId: number,
  scores: { retrieval_score?: number; rerank_score?: number }
) {
  const { retrieval_score = 0.5, rerank_score = 0.5 } = scores;

  const insertQuery = `
    INSERT INTO course_skills (course_id, skill_id, retrieval_score, rerank_score)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    retrieval_score = VALUES(retrieval_score),
    rerank_score = VALUES(rerank_score)
  `;

  return await query(insertQuery, [courseId, skillId, retrieval_score, rerank_score]);
}

export async function updateCourseSkillAssignment(
  courseId: number,
  skillId: number,
  scores: { retrieval_score?: number; rerank_score?: number }
) {
  const updates: string[] = [];
  const params: any[] = [];

  if (scores.retrieval_score !== undefined) {
    updates.push('retrieval_score = ?');
    params.push(scores.retrieval_score);
  }

  if (scores.rerank_score !== undefined) {
    updates.push('rerank_score = ?');
    params.push(scores.rerank_score);
  }

  if (updates.length === 0) {
    throw new Error('No updates provided');
  }

  params.push(courseId, skillId);

  const updateQuery = `
    UPDATE course_skills 
    SET ${updates.join(', ')}
    WHERE course_id = ? AND skill_id = ?
  `;

  return await query(updateQuery, params);
}

export async function deleteCourseSkillAssignment(courseId: number, skillId: number) {
  const deleteQuery = `
    DELETE FROM course_skills 
    WHERE course_id = ? AND skill_id = ?
  `;

  return await query(deleteQuery, [courseId, skillId]);
}

export async function createJobSkillAssignment(
  jobId: number,
  skillId: number,
  properties: { is_essential?: boolean; skill_level?: string }
) {
  const { is_essential = true, skill_level = 'intermediate' } = properties;

  const insertQuery = `
    INSERT INTO job_skills (job_id, skill_id, is_essential, skill_level)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    is_essential = VALUES(is_essential),
    skill_level = VALUES(skill_level)
  `;

  return await query(insertQuery, [jobId, skillId, is_essential, skill_level]);
}

export async function updateJobSkillAssignment(
  jobId: number,
  skillId: number,
  properties: { is_essential?: boolean; skill_level?: string }
) {
  const updates: string[] = [];
  const params: any[] = [];

  if (properties.is_essential !== undefined) {
    updates.push('is_essential = ?');
    params.push(properties.is_essential);
  }

  if (properties.skill_level !== undefined) {
    updates.push('skill_level = ?');
    params.push(properties.skill_level);
  }

  if (updates.length === 0) {
    throw new Error('No updates provided');
  }

  params.push(jobId, skillId);

  const updateQuery = `
    UPDATE job_skills 
    SET ${updates.join(', ')}
    WHERE job_id = ? AND skill_id = ?
  `;

  return await query(updateQuery, params);
}

export async function deleteJobSkillAssignment(jobId: number, skillId: number) {
  const deleteQuery = `
    DELETE FROM job_skills 
    WHERE job_id = ? AND skill_id = ?
  `;

  return await query(deleteQuery, [jobId, skillId]);
}

export async function getCourseSkillAssignments(courseId: number) {
  const assignmentsQuery = `
    SELECT 
      cs.skill_id,
      s.esco_id,
      COALESCE(s.preferred_label_el, s.preferred_label) as skill_name,
      cs.retrieval_score,
      cs.rerank_score,
      s.skill_type,
      s.is_digital_skill
    FROM course_skills cs
    JOIN skills s ON cs.skill_id = s.id
    WHERE cs.course_id = ?
    ORDER BY cs.rerank_score DESC, skill_name
  `;

  return await query(assignmentsQuery, [courseId]);
}

export async function getJobSkillAssignments(jobId: number) {
  const assignmentsQuery = `
    SELECT 
      js.skill_id,
      s.esco_id,
      COALESCE(s.preferred_label_el, s.preferred_label) as skill_name,
      js.is_essential,
      js.skill_level,
      s.skill_type,
      s.is_digital_skill
    FROM job_skills js
    JOIN skills s ON js.skill_id = s.id
    WHERE js.job_id = ?
    ORDER BY js.is_essential DESC, skill_name
  `;

  return await query(assignmentsQuery, [jobId]);
}

export async function getSkillsNotInCourse(
  courseId: number,
  searchTerm: string = '',
  limit: number = 20
) {
  const searchQuery = `
    SELECT 
      s.id,
      s.esco_id,
      COALESCE(s.preferred_label_el, s.preferred_label) as skill_name,
      s.skill_type,
      s.is_digital_skill
    FROM skills s
    WHERE s.id NOT IN (
      SELECT skill_id FROM course_skills WHERE course_id = ?
    )
    AND (
      s.preferred_label LIKE ? OR 
      s.preferred_label_el LIKE ? OR
      s.description LIKE ? OR 
      s.description_el LIKE ?
    )
    ORDER BY skill_name
    LIMIT ${Number(limit)}
  `;

  const searchPattern = `%${searchTerm}%`;
  return await query(searchQuery, [
    courseId,
    searchPattern,
    searchPattern,
    searchPattern,
    searchPattern,
  ]);
}

export async function getSkillsNotInJob(
  jobId: number,
  searchTerm: string = '',
  limit: number = 20
) {
  const searchQuery = `
    SELECT 
      s.id,
      s.esco_id,
      COALESCE(s.preferred_label_el, s.preferred_label) as skill_name,
      s.skill_type,
      s.is_digital_skill
    FROM skills s
    WHERE s.id NOT IN (
      SELECT skill_id FROM job_skills WHERE job_id = ?
    )
    AND (
      s.preferred_label LIKE ? OR 
      s.preferred_label_el LIKE ? OR
      s.description LIKE ? OR 
      s.description_el LIKE ?
    )
    ORDER BY skill_name
    LIMIT ${Number(limit)}
  `;

  const searchPattern = `%${searchTerm}%`;
  return await query(searchQuery, [
    jobId,
    searchPattern,
    searchPattern,
    searchPattern,
    searchPattern,
  ]);
}

export async function triggerLearningPathRegeneration(jobIds?: number[]) {
  if (jobIds && jobIds.length > 0) {
    const placeholders = jobIds.map(() => '?').join(',');

    await query(
      'DELETE FROM learning_path_skill_coverage WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE job_id IN (?))',
      [jobIds]
    );
    await query(
      'DELETE FROM learning_path_courses WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE job_id IN (?))',
      [jobIds]
    );
    await query(`DELETE FROM learning_paths WHERE job_id IN (${placeholders})`, jobIds);
  } else {
    await query('DELETE FROM learning_path_skill_coverage', []);
    await query('DELETE FROM learning_path_courses', []);
    await query('DELETE FROM learning_paths', []);
  }

  return { success: true, message: 'Learning paths cleared. Run regeneration script to rebuild.' };
}

export async function getAssignmentStats() {
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM course_skills) as total_course_skills,
      (SELECT COUNT(*) FROM job_skills) as total_job_skills,
      (SELECT COUNT(*) FROM learning_paths) as total_learning_paths,
      (SELECT COUNT(*) FROM courses WHERE id NOT IN (SELECT DISTINCT course_id FROM course_skills)) as courses_without_skills,
      (SELECT COUNT(*) FROM skills WHERE id NOT IN (SELECT DISTINCT skill_id FROM course_skills)) as skills_without_courses,
      (SELECT COUNT(*) FROM job_profiles WHERE id NOT IN (SELECT DISTINCT job_id FROM job_skills)) as jobs_without_skills,
      (SELECT COUNT(*) FROM skills WHERE id NOT IN (SELECT DISTINCT skill_id FROM job_skills)) as skills_without_jobs
  `;

  const stats = await query(statsQuery, []);
  return Array.isArray(stats) && stats.length > 0 ? stats[0] : {};
}
