import mysql from 'mysql2/promise';

// Database connection configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'skillsdb',
  // Handle connection timeouts gracefully
  connectTimeout: 10000, // 10 seconds
  waitForConnections: true,
};

// Create a connection pool or handle if we're in a build environment
let pool: mysql.Pool;

try {
  pool = mysql.createPool(dbConfig);
} catch (error) {
  console.error('Could not create MySQL connection pool:', error);
  throw new Error(`Failed to establish MySQL connection: ${error}`);
}

export async function query(sql: string, params: any[] = []) {
  try {
    // If pool is not initialized, throw an error - connection failed
    if (!pool) {
      throw new Error('MySQL connection pool not initialized. Connection failed.');
    }

    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database query error:', error);

    // Throw the error to be handled by the caller
    throw error;
  }
}

export async function getCourse(id: string) {
  const courseQuery = `
    SELECT c.id, c.name as courseName, i.name as institutionName, i.id as institution_id, c.language, c.provider, c.external_url 
    FROM courses c
    LEFT JOIN institutions i ON c.institution_id = i.id
    WHERE c.id = ?
  `;

  const courses = await query(courseQuery, [id]);
  if (!courses || (courses as any[]).length === 0) {
    return null;
  }

  const course = (courses as any[])[0];

  // Get skills for this course
  const skillsQuery = `
    SELECT s.id, s.esco_id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, COALESCE(s.description_el, s.description) as description, s.alt_labels, 
           s.skill_type, s.skill_category, s.skill_group, s.is_digital_skill,
           cs.retrieval_score, cs.rerank_score
    FROM skills s
    JOIN course_skills cs ON s.id = cs.skill_id
    WHERE cs.course_id = ?
  `;

  const skills = await query(skillsQuery, [id]);

  // Get course nodes (structured content)
  const nodesQuery = `
    SELECT node_id, parent_node_id, label, text, level
    FROM course_nodes
    WHERE course_id = ?
    ORDER BY level ASC, 
    CASE 
      WHEN text REGEXP '^[0-9]+\\.' THEN CAST(SUBSTRING_INDEX(text, '.', 1) AS UNSIGNED)
      ELSE 9999
    END ASC,
    node_id ASC
  `;

  const nodes = await query(nodesQuery, [id]);

  // Build a hierarchical structure from flat nodes array
  const nodeMap = new Map();
  const rootNodes: any[] = [];

  // First, create a map of all nodes
  (nodes as any[]).forEach((node) => {
    node.children = [];
    nodeMap.set(node.node_id, node);
  });

  // Then, build the tree structure
  (nodes as any[]).forEach((node) => {
    if (node.parent_node_id) {
      const parent = nodeMap.get(node.parent_node_id);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootNodes.push(node);
    }
  });

  // Get learning paths that include this course
  const learningPathsQuery = `
    SELECT lp.id, lp.name, lp.description, lp.essential_skills_match_percent, 
           lp.total_skills_match_percent, jp.id as job_id, jp.title as job_title
    FROM learning_paths lp
    JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
    JOIN job_profiles jp ON lp.job_id = jp.id
    WHERE lpc.course_id = ?
    ORDER BY lp.essential_skills_match_percent DESC, lp.total_skills_match_percent DESC
  `;

  const learningPaths = await query(learningPathsQuery, [id]);

  return {
    ...course,
    skills: skills || [],
    content: rootNodes || [],
    learningPaths: learningPaths || [],
  };
}

export async function getSkill(id: string) {
  const skillQuery = `
    SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, COALESCE(alt_labels_el, alt_labels) as alt_labels,
           skill_type, skill_category, skill_group, parent_skill_id,
           hierarchy_level, is_broader_skill, is_digital_skill
    FROM skills
    WHERE id = ? OR esco_id = ?
  `;

  const skills = await query(skillQuery, [id, id]);
  if (!skills || (skills as any[]).length === 0) {
    return null;
  }

  const skill = (skills as any[])[0];

  // Get courses for this skill
  const coursesQuery = `
    SELECT c.id, c.name as courseName, i.name as institutionName, 
           cs.retrieval_score, cs.rerank_score
    FROM courses c
    JOIN course_skills cs ON c.id = cs.course_id
    JOIN institutions i ON c.institution_id = i.id
    WHERE cs.skill_id = ?
    ORDER BY cs.retrieval_score DESC, cs.rerank_score DESC
  `;

  const courses = await query(coursesQuery, [skill.id]);

  // Get parent skill if exists
  let parentSkill = null;
  if (skill.parent_skill_id) {
    const parentSkillQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description 
      FROM skills
      WHERE id = ?
    `;
    const parentSkills = await query(parentSkillQuery, [skill.parent_skill_id]);
    if (parentSkills && (parentSkills as any[]).length > 0) {
      parentSkill = (parentSkills as any[])[0];
    }
  }

  // Get child skills if this is a broader skill
  let childSkills: any[] = [];
  if (skill.is_broader_skill) {
    const childSkillsQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, hierarchy_level
      FROM skills
      WHERE parent_skill_id = ?
      ORDER BY preferred_label
    `;
    const childSkillsResult = await query(childSkillsQuery, [skill.id]);
    childSkills = Array.isArray(childSkillsResult) ? childSkillsResult : [];
  }

  return {
    ...skill,
    courses: courses || [],
    parentSkill,
    childSkills,
  };
}

export async function getInstitution(id: string) {
  const institutionQuery = `
    SELECT id, name, description, website, logo_url
    FROM institutions
    WHERE id = ?
  `;

  const institutions = await query(institutionQuery, [id]);
  if (!institutions || (institutions as any[]).length === 0) {
    return null;
  }

  const institution = (institutions as any[])[0];

  // Get courses for this institution
  const coursesQuery = `
    SELECT c.id, c.name as courseName, c.language, c.provider
    FROM courses c
    WHERE c.institution_id = ?
  `;

  const courses = await query(coursesQuery, [institution.id]);

  // Get skills for each course
  const coursesWithSkills: any[] = [];
  for (const course of courses as any[]) {
    const skillsQuery = `
      SELECT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.is_digital_skill
      FROM skills s
      JOIN course_skills cs ON s.id = cs.skill_id
      WHERE cs.course_id = ?
      ORDER BY cs.retrieval_score DESC, preferred_label
    `;

    const skills = await query(skillsQuery, [course.id]);
    coursesWithSkills.push({
      ...course,
      skills: skills || [],
    });
  }

  return {
    ...institution,
    courses: coursesWithSkills,
  };
}

export async function getAllCourses(limit: number = 100, offset: number = 0) {
  // Convert limit and offset to numbers and use them directly in the query
  // as MySQL prepared statements have issues with LIMIT/OFFSET parameters
  const coursesQuery = `
    SELECT c.id, c.name as courseName, i.name as institutionName, c.language, c.provider
    FROM courses c
    LEFT JOIN institutions i ON c.institution_id = i.id
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(coursesQuery, []);
}

export async function getAllCoursesWithJobProfiles(limit: number = 100, offset: number = 0) {
  const coursesQuery = `
    SELECT 
      c.id, 
      c.name as courseName, 
      i.name as institutionName, 
      c.language, 
      c.provider,
      c.external_url,
      COUNT(DISTINCT jp.id) as matching_job_profiles,
      COUNT(DISTINCT cs.skill_id) as skill_count,
      AVG(cs.rerank_score) as avg_skill_score,
      GROUP_CONCAT(DISTINCT jp.title ORDER BY jp.title SEPARATOR ', ') as job_profile_titles
    FROM courses c
    LEFT JOIN institutions i ON c.institution_id = i.id
    LEFT JOIN course_skills cs ON c.id = cs.course_id AND cs.rerank_score > 0.5
    LEFT JOIN job_skills js ON cs.skill_id = js.skill_id
    LEFT JOIN job_profiles jp ON js.job_id = jp.id
    GROUP BY c.id, c.name, i.name, c.language, c.provider, c.external_url
    ORDER BY matching_job_profiles DESC, avg_skill_score DESC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  const courses = await query(coursesQuery, []);

  // Get top skills for each course
  const coursesWithSkills = await Promise.all(
    (courses as any[]).map(async (course) => {
      const skillsQuery = `
        SELECT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.skill_group,
               CAST(CASE WHEN s.skill_type = 'skill' THEN 1 ELSE 0 END AS UNSIGNED) as is_digital_skill,
               cs.rerank_score
        FROM course_skills cs
        JOIN skills s ON cs.skill_id = s.id
        WHERE cs.course_id = ? AND cs.rerank_score > 0.5
        ORDER BY cs.rerank_score DESC
        LIMIT 5
      `;

      const skills = await query(skillsQuery, [course.id]);
      return {
        ...course,
        skills: Array.isArray(skills) ? skills : [],
      };
    })
  );

  return coursesWithSkills;
}

export async function getAllSkills(limit: number = 100, offset: number = 0) {
  // Convert limit and offset to numbers and use them directly in the query
  const skillsQuery = `
    SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, alt_labels,
           parent_skill_id, hierarchy_level, is_broader_skill, is_digital_skill
    FROM skills
    ORDER BY hierarchy_level ASC, is_broader_skill DESC, preferred_label ASC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(skillsQuery, []);
}

export async function getAllInstitutions(limit: number = 100, offset: number = 0) {
  // Convert limit and offset to numbers and use them directly in the query
  const institutionsQuery = `
    SELECT i.id, i.name, i.description, i.logo_url,
           COUNT(c.id) as courseCount
    FROM institutions i
    LEFT JOIN courses c ON i.id = c.institution_id
    GROUP BY i.id, i.name, i.description, i.logo_url
    ORDER BY i.name
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(institutionsQuery, []);
}

export async function getInstitutionsBySource(
  source: string,
  limit: number = 100,
  offset: number = 0
) {
  // Get institutions that have courses from the specified source
  const institutionsQuery = `
    SELECT i.id, i.name, i.description, i.logo_url,
           COUNT(c.id) as courseCount
    FROM institutions i
    JOIN courses c ON i.id = c.institution_id
    WHERE c.source = ?
    GROUP BY i.id, i.name, i.description, i.logo_url
    ORDER BY i.name
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(institutionsQuery, [source]);
}

export async function searchCourses(searchTerm: string, limit: number = 20) {
  const searchQuery = `
    SELECT c.id, c.name as courseName, i.name as institutionName
    FROM courses c
    JOIN institutions i ON c.institution_id = i.id
    WHERE c.name LIKE ? OR i.name LIKE ?
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
}

export async function searchSkills(searchTerm: string, limit: number = 20) {
  const searchQuery = `
    SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, is_digital_skill
    FROM skills
    WHERE preferred_label LIKE ? OR description LIKE ? OR preferred_label_el LIKE ? OR description_el LIKE ?
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
  ]);
}

export async function getRelatedSkills(skillId: string, limit: number = 10) {
  // Get current skill first to check its parent and if it's a broader skill
  const skillData = (await query(
    'SELECT id, parent_skill_id, is_broader_skill, skill_group FROM skills WHERE id = ?',
    [skillId]
  )) as any[];

  if (!skillData || skillData.length === 0) {
    return [];
  }

  const skill = skillData[0];
  let allRelatedSkills: any[] = [];

  // 1. Add sibling skills (skills with the same parent)
  if (skill && skill.parent_skill_id) {
    const siblingSkillsQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type, skill_group, is_digital_skill, 'sibling' as relation_type
      FROM skills
      WHERE parent_skill_id = ? AND id != ?
      ORDER BY preferred_label
      LIMIT 20
    `;

    const siblingSkills = (await query(siblingSkillsQuery, [
      skill.parent_skill_id,
      skillId,
    ])) as any[];
    if (siblingSkills && siblingSkills.length > 0) {
      allRelatedSkills = [...allRelatedSkills, ...siblingSkills];
    }
  }

  // 2. Add child skills if this is a broader skill
  if (skill && skill.is_broader_skill) {
    const childSkillsQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type, skill_group, is_digital_skill, 'child' as relation_type
      FROM skills
      WHERE parent_skill_id = ?
      ORDER BY preferred_label
      LIMIT 20
    `;

    const childSkills = (await query(childSkillsQuery, [skillId])) as any[];
    if (childSkills && childSkills.length > 0) {
      allRelatedSkills = [...allRelatedSkills, ...childSkills];
    }
  }

  // 3. Add parent skill if it exists
  if (skill && skill.parent_skill_id) {
    const parentSkillQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type, skill_group, is_digital_skill, 'parent' as relation_type
      FROM skills
      WHERE id = ?
    `;

    const parentSkill = (await query(parentSkillQuery, [skill.parent_skill_id])) as any[];
    if (parentSkill && parentSkill.length > 0) {
      allRelatedSkills = [...allRelatedSkills, ...parentSkill];
    }
  }

  // 4. Add skills from the same courses (traditional related skills)
  // Find courses that teach this skill
  const coursesWithSkillQuery = `
    SELECT DISTINCT course_id 
    FROM course_skills 
    WHERE skill_id = ?
  `;

  const courseResults = (await query(coursesWithSkillQuery, [skillId])) as any[];
  if (courseResults && courseResults.length > 0) {
    const courseIds = courseResults.map((row) => row.course_id);

    // Find other skills taught in these courses
    const courseRelatedSkillsQuery = `
      SELECT s.id, s.esco_id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.skill_group, s.is_digital_skill, 
             COUNT(cs.course_id) as course_count, 'course' as relation_type
      FROM skills s
      JOIN course_skills cs ON s.id = cs.skill_id
      WHERE cs.course_id IN (?) AND s.id != ?
      GROUP BY s.id
      ORDER BY course_count DESC
      LIMIT 20
    `;

    const courseRelatedSkills = (await query(courseRelatedSkillsQuery, [
      courseIds,
      skillId,
    ])) as any[];
    if (courseRelatedSkills && courseRelatedSkills.length > 0) {
      allRelatedSkills = [...allRelatedSkills, ...courseRelatedSkills];
    }
  }

  // 5. If we still don't have enough related skills, add skills from the same group
  if (skill && skill.skill_group && allRelatedSkills.length < 10) {
    // Create a list of skill IDs we already have
    const existingIds = allRelatedSkills.map((s) => s.id).concat([skillId]);

    try {
      const groupSkillsQuery = `
        SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type, skill_group, is_digital_skill, 'group' as relation_type
        FROM skills
        WHERE skill_group = ? AND id != ? AND id NOT IN (${existingIds.map(() => '?').join(',')})
        ORDER BY RAND()
        LIMIT ${10 - allRelatedSkills.length}
      `;

      const groupSkills = (await query(groupSkillsQuery, [
        skill.skill_group,
        skillId,
        ...existingIds,
      ])) as any[];

      if (groupSkills && groupSkills.length > 0) {
        allRelatedSkills = [...allRelatedSkills, ...groupSkills];
      }
    } catch (error) {
      // Fallback if the NOT IN clause fails with too many parameters
      const simpleGroupSkillsQuery = `
        SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type, skill_group, is_digital_skill, 'group' as relation_type
        FROM skills
        WHERE skill_group = ? AND id != ?
        ORDER BY RAND()
        LIMIT ${10 - allRelatedSkills.length}
      `;

      const groupSkills = (await query(simpleGroupSkillsQuery, [
        skill.skill_group,
        skillId,
      ])) as any[];
      if (groupSkills && groupSkills.length > 0) {
        // Filter out duplicates manually
        const newSkills = groupSkills.filter((s) => !existingIds.includes(s.id));
        allRelatedSkills = [...allRelatedSkills, ...newSkills];
      }
    }
  }

  // Deduplicate skills (just in case there are duplicates)
  const uniqueSkills = Array.from(new Map(allRelatedSkills.map((s) => [s.id, s])).values());

  // Limit to the requested number
  return uniqueSkills.slice(0, Number(limit));
}

export async function getRelatedJobProfiles(skillIds: string[], limit: number = 10) {
  if (!skillIds || skillIds.length === 0) {
    return [];
  }

  const skillIdsArray = Array.isArray(skillIds) ? skillIds : [skillIds];
  const numLimit = Number(limit);

  const jobQuery = `
    SELECT jp.id, jp.title, jp.description, jp.alt_titles,
           COUNT(js.skill_id) as matching_skills,
           GROUP_CONCAT(DISTINCT COALESCE(s.preferred_label_el, s.preferred_label) SEPARATOR ', ') as skill_labels
    FROM job_profiles jp
    JOIN job_skills js ON jp.id = js.job_id
    JOIN skills s ON js.skill_id = s.id
    WHERE js.skill_id IN (?) 
    GROUP BY jp.id
    ORDER BY matching_skills DESC, jp.title
    LIMIT ${numLimit}
  `;

  try {
    const jobs = await query(jobQuery, [skillIdsArray]);
    return jobs || [];
  } catch (error) {
    // Log error without using console directly
    /* eslint-disable-next-line no-console */
    console.error('Error getting related job profiles:', error);
    return [];
  }
}

/**
 * Get skills by parent ID to display skill hierarchy
 */
export async function getSkillsByParentId(parentId: string | null, limit: number = 100) {
  let skillsQuery;

  if (parentId === null) {
    // Get top-level skills (those without a parent)
    skillsQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, 
             skill_type, skill_category, skill_group, is_broader_skill, hierarchy_level
      FROM skills
      WHERE parent_skill_id IS NULL
      ORDER BY preferred_label
      LIMIT ${Number(limit)}
    `;
    return await query(skillsQuery, []);
  } else {
    // Get child skills of the specified parent
    skillsQuery = `
      SELECT id, esco_id, COALESCE(preferred_label_el, preferred_label) as preferred_label, COALESCE(description_el, description) as description, 
             skill_type, skill_category, skill_group, is_broader_skill, hierarchy_level
      FROM skills
      WHERE parent_skill_id = ?
      ORDER BY preferred_label
      LIMIT ${Number(limit)}
    `;
    return await query(skillsQuery, [parentId]);
  }
}

/**
 * Get related skills by skill group or category
 */
/**
 * Get a job profile by ID
 */
export async function getJobProfile(id: string) {
  const jobQuery = `
    SELECT id, title, description, alt_titles, 
           isco_group, hierarchy_level, parent_job_id, is_broader_job
    FROM job_profiles
    WHERE id = ?
  `;

  const jobs = await query(jobQuery, [id]);
  if (!jobs || (jobs as any[]).length === 0) {
    return null;
  }

  const job = (jobs as any[])[0];

  // Get skills for this job profile
  const skillsQuery = `
    SELECT s.id, s.esco_id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, COALESCE(s.description_el, s.description) as description,
           js.is_essential, js.skill_level, s.is_digital_skill
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
    ORDER BY js.is_essential DESC, preferred_label
  `;

  const skills = await query(skillsQuery, [job.id]);

  // Get courses that teach the skills required for this job
  const coursesQuery = `
    SELECT DISTINCT c.id, c.name as courseName, i.name as institutionName, 
           COUNT(DISTINCT cs.skill_id) as matching_skills
    FROM courses c
    JOIN course_skills cs ON c.id = cs.course_id
    JOIN institutions i ON c.institution_id = i.id
    JOIN job_skills js ON cs.skill_id = js.skill_id
    WHERE js.job_id = ?
    GROUP BY c.id
    ORDER BY matching_skills DESC
    LIMIT 10
  `;

  const courses = await query(coursesQuery, [job.id]);

  // Get learning paths for this job with skill counts
  const learningPathsQuery = `
    SELECT lp.id, lp.name, lp.description,
           lp.essential_skills_match_percent, lp.total_skills_match_percent,
           lp.score, COUNT(lpc.course_id) as course_count,
           (SELECT COUNT(DISTINCT js.skill_id) FROM job_skills js WHERE js.job_id = ? AND js.is_essential = 1) as total_essential_skills,
           (SELECT COUNT(DISTINCT js.skill_id) FROM job_skills js WHERE js.job_id = ? AND js.is_essential = 0) as total_non_essential_skills,
           (SELECT COUNT(DISTINCT lpsc.skill_id) FROM learning_path_skill_coverage lpsc 
            JOIN job_skills js ON lpsc.skill_id = js.skill_id 
            WHERE lpsc.learning_path_id = lp.id AND js.job_id = ? AND js.is_essential = 1) as covered_essential_skills,
           (SELECT COUNT(DISTINCT lpsc.skill_id) FROM learning_path_skill_coverage lpsc 
            JOIN job_skills js ON lpsc.skill_id = js.skill_id 
            WHERE lpsc.learning_path_id = lp.id AND js.job_id = ? AND js.is_essential = 0) as covered_non_essential_skills
    FROM learning_paths lp
    LEFT JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
    WHERE lp.job_id = ?
    GROUP BY lp.id
    ORDER BY lp.score DESC, lp.essential_skills_match_percent DESC, lp.total_skills_match_percent DESC
  `;

  const learningPaths = await query(learningPathsQuery, [job.id, job.id, job.id, job.id, job.id]);

  // Get courses for each learning path
  const learningPathsWithCourses: any[] = [];
  for (const path of learningPaths as any[]) {
    const pathCoursesQuery = `
      SELECT c.id, c.name, i.name as institution_name,
             lpc.sequence_order, lpc.is_prerequisite
      FROM learning_path_courses lpc
      JOIN courses c ON lpc.course_id = c.id
      JOIN institutions i ON c.institution_id = i.id
      WHERE lpc.learning_path_id = ?
      ORDER BY lpc.sequence_order
    `;

    const pathCourses = await query(pathCoursesQuery, [path.id]);

    // Get skills for each course that are relevant to this job
    const coursesWithSkills: any[] = [];
    const cumulativeEssentialSkills = new Set();

    // First pass: collect all course skills
    for (let i = 0; i < (pathCourses as any[]).length; i++) {
      const course = (pathCourses as any[])[i];
      const courseSkillsQuery = `
        SELECT DISTINCT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.is_digital_skill,
               js.is_essential, js.skill_level
        FROM skills s
        JOIN course_skills cs ON s.id = cs.skill_id
        JOIN job_skills js ON s.id = js.skill_id
        WHERE cs.course_id = ? AND js.job_id = ?
        ORDER BY js.is_essential DESC, preferred_label
      `;

      const courseSkills = await query(courseSkillsQuery, [course.id, job.id]);

      // Track cumulative essential skills
      (courseSkills as any[]).forEach((skill) => {
        if (skill.is_essential) {
          cumulativeEssentialSkills.add(skill.id);
        }
      });

      coursesWithSkills.push({
        ...course,
        skills: courseSkills || [],
        cumulativeEssentialCount: cumulativeEssentialSkills.size,
        isLastEssentialCourse: false, // Will be determined in second pass
      });
    }

    // Second pass: find the last course that teaches essential skills
    let lastEssentialCourseIndex = -1;
    for (let i = coursesWithSkills.length - 1; i >= 0; i--) {
      const hasEssentialSkills = coursesWithSkills[i].skills.some(
        (skill: any) => skill.is_essential
      );
      if (hasEssentialSkills) {
        lastEssentialCourseIndex = i;
        break;
      }
    }

    // Mark the last essential course
    if (lastEssentialCourseIndex >= 0) {
      coursesWithSkills[lastEssentialCourseIndex].isLastEssentialCourse = true;
    }

    learningPathsWithCourses.push({
      ...path,
      courses: coursesWithSkills,
    });
  }

  // Get parent job if exists
  let parentJob = null;
  if (job.parent_job_id) {
    const parentJobQuery = `
      SELECT id, title, description 
      FROM job_profiles
      WHERE id = ?
    `;
    const parentJobs = await query(parentJobQuery, [job.parent_job_id]);
    if (parentJobs && (parentJobs as any[]).length > 0) {
      parentJob = (parentJobs as any[])[0];
    }
  }

  // Get child jobs if this is a broader job
  let childJobs: any[] = [];
  if (job.is_broader_job) {
    const childJobsQuery = `
      SELECT id, title, description
      FROM job_profiles
      WHERE parent_job_id = ?
      ORDER BY title
    `;
    const childJobsResult = await query(childJobsQuery, [job.id]);
    childJobs = Array.isArray(childJobsResult) ? childJobsResult : [];
  }

  return {
    ...job,
    skills: skills || [],
    courses: courses || [],
    learningPaths: learningPathsWithCourses || [],
    parentJob,
    childJobs,
  };
}

/**
 * Get all job profiles
 */
export async function getAllJobProfiles(limit: number = 100, offset: number = 0) {
  const jobsQuery = `
    SELECT id, title, description, alt_titles,
           isco_group, hierarchy_level, is_broader_job
    FROM job_profiles
    ORDER BY title
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  const jobs = await query(jobsQuery, []);

  // Get skills for each job profile
  const jobsWithSkills: any[] = [];
  for (const job of jobs as any[]) {
    const skillsQuery = `
      SELECT s.id, s.esco_id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, COALESCE(s.description_el, s.description) as description,
             js.is_essential, js.skill_level, s.is_digital_skill
      FROM skills s
      JOIN job_skills js ON s.id = js.skill_id
      WHERE js.job_id = ?
      ORDER BY js.is_essential DESC, preferred_label
    `;

    const skills = await query(skillsQuery, [job.id]);
    jobsWithSkills.push({
      ...job,
      skills: skills || [],
    });
  }

  return jobsWithSkills;
}

/**
 * Search job profiles by term
 */
export async function searchJobProfiles(searchTerm: string, limit: number = 20) {
  const searchQuery = `
    SELECT id, COALESCE(title, title_en) as title, COALESCE(description, description_en) as description
    FROM job_profiles
    WHERE title LIKE ? OR title_en LIKE ? OR description LIKE ? OR description_en LIKE ? OR alt_titles LIKE ?
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
  ]);
}

/**
 * Search institutions by name
 */
export async function searchInstitutions(searchTerm: string, limit: number = 20) {
  const searchQuery = `
    SELECT i.id, i.name, i.description, i.website, i.logo_url,
           COUNT(c.id) as courseCount
    FROM institutions i
    LEFT JOIN courses c ON i.id = c.institution_id
    WHERE i.name LIKE ? OR i.description LIKE ?
    GROUP BY i.id, i.name, i.description, i.website, i.logo_url
    ORDER BY i.name
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
}

export async function getSkillsByGroup(skillId: string, limit: number = 8) {
  // First, get the skill group and category
  const skillInfo = (await query(
    'SELECT id, skill_group, skill_category FROM skills WHERE id = ?',
    [skillId]
  )) as any[];

  if (!skillInfo || skillInfo.length === 0) {
    return [];
  }

  const skill = skillInfo[0];

  // Query for skills in the same group
  let relatedSkillsQuery = `
    SELECT id, COALESCE(preferred_label_el, preferred_label) as preferred_label, skill_type 
    FROM skills 
    WHERE id != ? AND
    (skill_group = ? OR skill_category = ?)
    ORDER BY RAND()
    LIMIT ${Number(limit)}
  `;

  const relatedSkills = (await query(relatedSkillsQuery, [
    skill.id,
    skill.skill_group,
    skill.skill_category,
  ])) as any[];

  return relatedSkills;
}

/**
 * Get popular skills based on course relationships
 */
export async function getPopularSkills(limit: number = 6) {
  const popularSkillsQuery = `
    SELECT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.skill_group, s.skill_category,
           COUNT(cs.course_id) as course_count 
    FROM skills s
    JOIN course_skills cs ON s.id = cs.skill_id
    GROUP BY s.id, preferred_label, s.skill_type, s.skill_group, s.skill_category
    ORDER BY course_count DESC
    LIMIT ${Number(limit)}
  `;

  return await query(popularSkillsQuery, []);
}

/**
 * Get featured courses ranked by how many job profiles their skills match
 */
export async function getFeaturedCourses(limit: number = 6) {
  const featuredCoursesQuery = `
    SELECT 
      c.id,
      c.name,
      c.external_url,
      c.language,
      i.name as institution_name,
      i.id as institution_id,
      COUNT(DISTINCT jp.id) as job_profile_matches,
      COUNT(DISTINCT cs.skill_id) as total_skills,
      AVG(cs.rerank_score) as avg_skill_score,
      GROUP_CONCAT(DISTINCT jp.title ORDER BY jp.title SEPARATOR ', ') as matching_job_titles
    FROM courses c
    JOIN institutions i ON c.institution_id = i.id
    JOIN course_skills cs ON c.id = cs.course_id
    JOIN job_skills js ON cs.skill_id = js.skill_id
    JOIN job_profiles jp ON js.job_id = jp.id
    WHERE cs.rerank_score > 0.5
    GROUP BY c.id, c.name, c.external_url, c.language, i.name, i.id
    HAVING COUNT(DISTINCT jp.id) >= 2
    ORDER BY 
      job_profile_matches DESC,
      avg_skill_score DESC,
      total_skills DESC
    LIMIT ${Number(limit)}
  `;

  const courses = await query(featuredCoursesQuery, []);

  // Get skills for each course
  const coursesWithSkills = await Promise.all(
    (courses as any[]).map(async (course) => {
      const skillsQuery = `
        SELECT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.skill_group,
               CAST(CASE WHEN s.skill_type = 'skill' THEN 1 ELSE 0 END AS UNSIGNED) as is_digital_skill,
               cs.rerank_score
        FROM course_skills cs
        JOIN skills s ON cs.skill_id = s.id
        WHERE cs.course_id = ? AND cs.rerank_score > 0.5
        ORDER BY cs.rerank_score DESC
        LIMIT 10
      `;

      const skills = await query(skillsQuery, [course.id]);
      return {
        ...course,
        skills: Array.isArray(skills) ? skills : [],
      };
    })
  );

  return coursesWithSkills;
}

/**
 * Get featured learning paths diversified across different job profiles
 */
export async function getTopScoringLearningPaths(limit: number = 6) {
  const featuredPathsQuery = `
    SELECT * FROM (
      SELECT lp.id, lp.name, lp.description,
             lp.essential_skills_match_percent, lp.total_skills_match_percent,
             jp.title as job_title, jp.id as job_id,
             COUNT(DISTINCT lpc.course_id) as course_count,
             COALESCE(
               (lp.essential_skills_match_percent * 0.7 + lp.total_skills_match_percent * 0.3),
               0
             ) as score,
             ROW_NUMBER() OVER (PARTITION BY jp.id ORDER BY 
               COALESCE((lp.essential_skills_match_percent * 0.7 + lp.total_skills_match_percent * 0.3), 0) DESC
             ) as job_rank
      FROM learning_paths lp
      JOIN job_profiles jp ON lp.job_id = jp.id
      LEFT JOIN learning_path_courses lpc ON lp.id = lpc.learning_path_id
      GROUP BY lp.id, lp.name, lp.description, lp.essential_skills_match_percent, 
               lp.total_skills_match_percent, jp.title, jp.id
    ) ranked_paths
    WHERE job_rank = 1
    ORDER BY score DESC, essential_skills_match_percent DESC
    LIMIT ${Number(limit)}
  `;

  const learningPaths = await query(featuredPathsQuery, []);

  // Get skills for each learning path
  const pathsWithSkills: any[] = [];
  for (const path of learningPaths as any[]) {
    const skillsQuery = `
      SELECT DISTINCT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, s.skill_type, s.is_digital_skill
      FROM learning_path_skill_coverage lpsc
      JOIN skills s ON lpsc.skill_id = s.id
      WHERE lpsc.learning_path_id = ?
      ORDER BY preferred_label
      LIMIT 8
    `;

    const skills = await query(skillsQuery, [path.id]);
    pathsWithSkills.push({
      ...path,
      skills: Array.isArray(skills) ? skills : [],
    });
  }

  return pathsWithSkills;
}

export async function getPopularLearningPaths(limit: number = 2) {
  const popularPathsQuery = `
    SELECT lp.id, lp.name, lp.description,
           jp.title as job_title, jp.id as job_id,
           lp.view_count
    FROM learning_paths lp
    JOIN job_profiles jp ON lp.job_id = jp.id
    ORDER BY lp.view_count DESC
    LIMIT ${Number(limit)}
  `;
  return await query(popularPathsQuery, []);
}

export async function getTopInDemandDigitalSkills(limit: number = 5) {
  const skillsQuery = `
    SELECT s.id, COALESCE(s.preferred_label_el, s.preferred_label) as preferred_label, COUNT(js.skill_id) as job_count
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE s.is_digital_skill = 1
    GROUP BY s.id, preferred_label
    ORDER BY job_count DESC
    LIMIT ${Number(limit)}
  `;
  return await query(skillsQuery, []);
}

export async function getJobCategories() {
  const categoriesQuery = `
    SELECT category, COUNT(*) as count
    FROM job_profiles
    WHERE category IS NOT NULL
    GROUP BY category
    ORDER BY count DESC
  `;
  return await query(categoriesQuery, []);
}

export async function searchAll(searchTerm: string, limit: number = 10) {
  const searchQuery = `
    (SELECT id, name, 'course' as type, NULL as description, NULL as institution_name, NULL as skill_count 
     FROM courses WHERE name LIKE ?)
    UNION
    (SELECT id, COALESCE(preferred_label_el, preferred_label) as name, 'skill' as type, 
     COALESCE(description_el, description) as description, NULL as institution_name, NULL as skill_count
     FROM skills WHERE preferred_label LIKE ? OR preferred_label_el LIKE ? OR description LIKE ? OR description_el LIKE ?)
    UNION
    (SELECT id, COALESCE(title, title_en) as name, 'job_profile' as type, 
     COALESCE(description, description_en) as description, NULL as institution_name, NULL as skill_count
     FROM job_profiles WHERE title LIKE ? OR title_en LIKE ? OR description LIKE ? OR description_en LIKE ?)
    UNION
    (SELECT i.id, i.name, 'institution' as type, NULL as description, NULL as institution_name, 
     COUNT(DISTINCT c.id) as skill_count
     FROM institutions i 
     LEFT JOIN courses c ON i.id = c.institution_id
     WHERE i.name LIKE ?
     GROUP BY i.id)
    LIMIT ${Number(limit)}
  `;
  const params = [
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
    `%${searchTerm}%`,
  ];
  return await query(searchQuery, params);
}
