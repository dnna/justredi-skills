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
    SELECT c.id, c.name as courseName, i.name as institutionName, i.id as institution_id, c.language, c.provider 
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
    SELECT s.id, s.esco_id, s.preferred_label, s.description, s.alt_labels, 
           s.skill_type, s.skill_category, s.skill_group,
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

  return {
    ...course,
    skills: skills || [],
    content: rootNodes || [],
  };
}

export async function getSkill(id: string) {
  const skillQuery = `
    SELECT id, esco_id, preferred_label, description, alt_labels,
           skill_type, skill_category, skill_group, parent_skill_id,
           hierarchy_level, is_broader_skill
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
      SELECT id, esco_id, preferred_label, description 
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
      SELECT id, esco_id, preferred_label, description, hierarchy_level
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
    SELECT id, name
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

  return {
    ...institution,
    courses: courses || [],
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

export async function getAllSkills(limit: number = 100, offset: number = 0) {
  // Convert limit and offset to numbers and use them directly in the query
  const skillsQuery = `
    SELECT id, esco_id, preferred_label, description, alt_labels,
           parent_skill_id, hierarchy_level, is_broader_skill
    FROM skills
    ORDER BY hierarchy_level ASC, is_broader_skill DESC, preferred_label ASC
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(skillsQuery, []);
}

export async function getAllInstitutions(limit: number = 100, offset: number = 0) {
  // Convert limit and offset to numbers and use them directly in the query
  const institutionsQuery = `
    SELECT id, name
    FROM institutions
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(institutionsQuery, []);
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
    SELECT id, esco_id, preferred_label, description
    FROM skills
    WHERE preferred_label LIKE ? OR description LIKE ?
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [`%${searchTerm}%`, `%${searchTerm}%`]);
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
      SELECT id, esco_id, preferred_label, skill_type, skill_group, 'sibling' as relation_type
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
      SELECT id, esco_id, preferred_label, skill_type, skill_group, 'child' as relation_type
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
      SELECT id, esco_id, preferred_label, skill_type, skill_group, 'parent' as relation_type
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
      SELECT s.id, s.esco_id, s.preferred_label, s.skill_type, s.skill_group, 
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
        SELECT id, esco_id, preferred_label, skill_type, skill_group, 'group' as relation_type
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
        SELECT id, esco_id, preferred_label, skill_type, skill_group, 'group' as relation_type
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
           GROUP_CONCAT(DISTINCT s.preferred_label SEPARATOR ', ') as skill_labels
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
      SELECT id, esco_id, preferred_label, description, 
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
      SELECT id, esco_id, preferred_label, description, 
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
    SELECT id, esco_id, title, description, alt_titles, 
           isco_group, hierarchy_level, parent_job_id, is_broader_job
    FROM job_profiles
    WHERE id = ? OR esco_id = ?
  `;

  const jobs = await query(jobQuery, [id, id]);
  if (!jobs || (jobs as any[]).length === 0) {
    return null;
  }

  const job = (jobs as any[])[0];

  // Get skills for this job profile
  const skillsQuery = `
    SELECT s.id, s.esco_id, s.preferred_label, s.description,
           js.is_essential, js.skill_level
    FROM skills s
    JOIN job_skills js ON s.id = js.skill_id
    WHERE js.job_id = ?
    ORDER BY js.is_essential DESC, s.preferred_label
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

  // Get parent job if exists
  let parentJob = null;
  if (job.parent_job_id) {
    const parentJobQuery = `
      SELECT id, esco_id, title, description 
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
      SELECT id, esco_id, title, description
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
    parentJob,
    childJobs,
  };
}

/**
 * Get all job profiles
 */
export async function getAllJobProfiles(limit: number = 100, offset: number = 0) {
  const jobsQuery = `
    SELECT id, esco_id, title, description, alt_titles,
           isco_group, hierarchy_level, is_broader_job
    FROM job_profiles
    ORDER BY title
    LIMIT ${Number(limit)} OFFSET ${Number(offset)}
  `;

  return await query(jobsQuery, []);
}

/**
 * Search job profiles by term
 */
export async function searchJobProfiles(searchTerm: string, limit: number = 20) {
  const searchQuery = `
    SELECT id, esco_id, title, description
    FROM job_profiles
    WHERE title LIKE ? OR description LIKE ? OR alt_titles LIKE ?
    LIMIT ${Number(limit)}
  `;

  return await query(searchQuery, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]);
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
    SELECT id, preferred_label, skill_type 
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
    SELECT s.id, s.preferred_label, s.skill_type, s.skill_group, s.skill_category,
           COUNT(cs.course_id) as course_count 
    FROM skills s
    JOIN course_skills cs ON s.id = cs.skill_id
    GROUP BY s.id
    ORDER BY course_count DESC
    LIMIT ${Number(limit)}
  `;

  return await query(popularSkillsQuery, []);
}
