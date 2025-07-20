import { query } from './db';

type JobSkill = {
  skill_id: number;
  is_essential: boolean;
  skill_level: string;
  skill_name: string;
};

type CourseWithSkills = {
  course_id: number;
  course_name: string;
  provider_id: number;
  skill_id: number;
  rerank_score: number;
  is_essential: boolean;
  skill_level: string;
};

type Course = {
  course_id: number;
  course_name: string;
  provider_id: number;
  skills: Set<number>;
  essentialSkills: Set<number>;
  additionalSkills: Set<number>;
  score: number;
};

type LearningPath = {
  courses: Course[];
  coveredSkills: Set<number>;
  essentialMatch: number;
  totalMatch: number;
  score: number;
};

export async function regenerateLearningPathsForJob(jobId: number) {
  console.log(`Regenerating learning paths for job ID: ${jobId}`);

  const [jobDetails] = (await query('SELECT id, title FROM job_profiles WHERE id = ?', [
    jobId,
  ])) as any[];
  if (!jobDetails) {
    throw new Error(`Job profile with ID ${jobId} not found`);
  }

  const jobSkills = (await query(
    `
    SELECT 
      js.skill_id,
      js.is_essential,
      js.skill_level,
      s.preferred_label as skill_name
    FROM job_skills js
    JOIN skills s ON js.skill_id = s.id
    WHERE js.job_id = ?
    ORDER BY js.is_essential DESC, js.skill_level DESC
  `,
    [jobId]
  )) as JobSkill[];

  if (jobSkills.length === 0) {
    console.log(`No skills found for job ${jobDetails.title}`);
    return { success: false, message: 'No skills found for this job profile' };
  }

  const skillIds = jobSkills.map((s) => s.skill_id);
  const placeholders = skillIds.map(() => '?').join(',');

  const coursesWithSkills = (await query(
    `
    SELECT 
      c.id as course_id,
      c.name as course_name,
      c.institution_id as provider_id,
      cs.skill_id,
      cs.rerank_score,
      js.is_essential,
      js.skill_level
    FROM courses c
    JOIN course_skills cs ON c.id = cs.course_id
    JOIN job_skills js ON cs.skill_id = js.skill_id AND js.job_id = ?
    WHERE cs.skill_id IN (${placeholders})
    ORDER BY js.is_essential DESC, cs.rerank_score DESC
  `,
    [jobId, ...skillIds]
  )) as CourseWithSkills[];

  if (coursesWithSkills.length === 0) {
    console.log(`No courses found that teach skills for ${jobDetails.title}`);
    return { success: false, message: 'No courses found that teach the required skills' };
  }

  await query(
    'DELETE FROM learning_path_skill_coverage WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE job_id = ?)',
    [jobId]
  );
  await query(
    'DELETE FROM learning_path_courses WHERE learning_path_id IN (SELECT id FROM learning_paths WHERE job_id = ?)',
    [jobId]
  );
  await query('DELETE FROM learning_paths WHERE job_id = ?', [jobId]);

  const paths = generateOptimalPaths(jobDetails, jobSkills, coursesWithSkills);

  let pathsCreated = 0;
  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const pathName =
      paths.length > 1
        ? `${jobDetails.title} Learning Path - Option ${i + 1}`
        : `${jobDetails.title} Learning Path`;

    const [result] = (await query(
      `
      INSERT INTO learning_paths (
        job_id, 
        name, 
        description, 
        essential_skills_match_percent, 
        total_skills_match_percent,
        score
      ) VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        jobId,
        pathName,
        `Learning path covering ${path.coveredSkills.size} skills with ${path.essentialMatch}% essential coverage`,
        path.essentialMatch,
        path.totalMatch,
        path.score,
      ]
    )) as any[];

    const pathId = result.insertId;

    for (let j = 0; j < path.courses.length; j++) {
      await query(
        `
        INSERT INTO learning_path_courses (
          learning_path_id,
          course_id,
          sequence_order,
          is_prerequisite
        ) VALUES (?, ?, ?, ?)
      `,
        [pathId, path.courses[j].course_id, j + 1, j === 0]
      );
    }

    for (const skillId of path.coveredSkills) {
      await query(
        `
        INSERT INTO learning_path_skill_coverage (
          learning_path_id,
          skill_id,
          is_covered,
          coverage_score
        ) VALUES (?, ?, ?, ?)
      `,
        [pathId, skillId, true, 100.0]
      );
    }

    pathsCreated++;
  }

  return {
    success: true,
    message: `Created ${pathsCreated} learning paths for ${jobDetails.title}`,
    pathsCreated,
  };
}

function generateOptimalPaths(
  job: any,
  jobSkills: JobSkill[],
  coursesWithSkills: CourseWithSkills[]
): LearningPath[] {
  const courseMap = new Map<number, Course>();

  coursesWithSkills.forEach((row) => {
    if (!courseMap.has(row.course_id)) {
      courseMap.set(row.course_id, {
        course_id: row.course_id,
        course_name: row.course_name,
        provider_id: row.provider_id,
        skills: new Set(),
        essentialSkills: new Set(),
        additionalSkills: new Set(),
        score: 0,
      });
    }

    const course = courseMap.get(row.course_id)!;
    course.skills.add(row.skill_id);
    if (row.is_essential) {
      course.essentialSkills.add(row.skill_id);
    } else {
      course.additionalSkills.add(row.skill_id);
    }
    course.score += (row.is_essential ? 3 : 1) * (row.rerank_score || 0.5);
  });

  const essentialSkills = new Set(jobSkills.filter((s) => s.is_essential).map((s) => s.skill_id));
  const additionalSkills = new Set(jobSkills.filter((s) => !s.is_essential).map((s) => s.skill_id));

  if (essentialSkills.size === 0) {
    console.log(`No essential skills defined for ${job.title}`);
    return [];
  }

  return generatePathsWithGreedyAlgorithm(
    courseMap,
    essentialSkills,
    additionalSkills,
    jobSkills.length
  );
}

function generatePathsWithGreedyAlgorithm(
  courseMap: Map<number, Course>,
  essentialSkills: Set<number>,
  additionalSkills: Set<number>,
  totalSkills: number
): LearningPath[] {
  const courses = Array.from(courseMap.values());
  const allSkills = new Set([...essentialSkills, ...additionalSkills]);
  const maxCourses = 8;
  const maxPaths = 5;

  const paths: LearningPath[] = [];

  for (let attempt = 0; attempt < maxPaths; attempt++) {
    const path: Course[] = [];
    const coveredSkills = new Set<number>();
    const remainingCourses = [...courses];

    while (path.length < maxCourses && remainingCourses.length > 0) {
      let bestCourse: Course | null = null;
      let bestScore = -1;
      let bestIndex = -1;

      for (let i = 0; i < remainingCourses.length; i++) {
        const course = remainingCourses[i];
        const newSkills = [...course.skills].filter(
          (s) => allSkills.has(s) && !coveredSkills.has(s)
        );

        if (newSkills.length === 0) continue;

        const essentialNewSkills = newSkills.filter((s) => essentialSkills.has(s)).length;
        const additionalNewSkills = newSkills.filter((s) => additionalSkills.has(s)).length;

        const courseScore = essentialNewSkills * 3 + additionalNewSkills + course.score / 100;

        if (courseScore > bestScore) {
          bestScore = courseScore;
          bestCourse = course;
          bestIndex = i;
        }
      }

      if (bestCourse) {
        path.push(bestCourse);
        [...bestCourse.skills].forEach((s) => {
          if (allSkills.has(s)) coveredSkills.add(s);
        });
        remainingCourses.splice(bestIndex, 1);
      } else {
        break;
      }
    }

    if (path.length > 0) {
      const pathMetrics = calculatePathMetrics(
        path,
        essentialSkills,
        additionalSkills,
        totalSkills
      );
      const pathScore = calculatePathScore(path, essentialSkills, additionalSkills, totalSkills);

      paths.push({
        courses: path,
        coveredSkills: pathMetrics.coveredSkills,
        essentialMatch: pathMetrics.essentialMatch,
        totalMatch: pathMetrics.totalMatch,
        score: pathScore,
      });
    }

    courses.sort(() => Math.random() - 0.5);
  }

  return removeDuplicatePaths(paths)
    .sort((a, b) => {
      const aScore = a.essentialMatch * 100 + a.totalMatch - a.courses.length;
      const bScore = b.essentialMatch * 100 + b.totalMatch - b.courses.length;
      return bScore - aScore;
    })
    .slice(0, 3);
}

function calculatePathMetrics(
  path: Course[],
  essentialSkills: Set<number>,
  additionalSkills: Set<number>,
  totalSkills: number
) {
  const coveredSkills = new Set<number>();

  for (const course of path) {
    for (const skillId of course.skills) {
      if (essentialSkills.has(skillId) || additionalSkills.has(skillId)) {
        coveredSkills.add(skillId);
      }
    }
  }

  const coveredEssential = [...coveredSkills].filter((s) => essentialSkills.has(s)).length;
  const essentialMatch =
    essentialSkills.size > 0 ? Math.round((coveredEssential / essentialSkills.size) * 100) : 100;
  const totalMatch = Math.round((coveredSkills.size / totalSkills) * 100);

  return { coveredSkills, essentialMatch, totalMatch };
}

function calculatePathScore(
  path: Course[],
  essentialSkills: Set<number>,
  additionalSkills: Set<number>,
  totalSkills: number
): number {
  const metrics = calculatePathMetrics(path, essentialSkills, additionalSkills, totalSkills);
  const essentialCoverage = metrics.essentialMatch / 100;
  const totalCoverage = metrics.totalMatch / 100;

  return Math.round(essentialCoverage * 300 + totalCoverage * 100 - path.length * 2);
}

function removeDuplicatePaths(paths: LearningPath[]): LearningPath[] {
  const unique: LearningPath[] = [];

  for (const path of paths) {
    const courseIds = path.courses
      .map((c) => c.course_id)
      .sort()
      .join(',');
    const isDuplicate = unique.some(
      (p) =>
        p.courses
          .map((c) => c.course_id)
          .sort()
          .join(',') === courseIds
    );

    if (!isDuplicate) {
      unique.push(path);
    }
  }

  return unique;
}
