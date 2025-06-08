const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

// Algorithm for generating learning paths:
// 1. For each job profile, get all required skills (essential and non-essential)
// 2. Find courses that teach these skills
// 3. Use a greedy algorithm to select minimum courses that maximize skill coverage
// 4. Prioritize courses that cover essential skills
// 5. Create multiple paths if there are different valid combinations

async function generateLearningPaths() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    // Clean up existing learning paths
    console.log('Cleaning up existing learning paths...');
    await connection.execute('DELETE FROM learning_path_skill_coverage');
    await connection.execute('DELETE FROM learning_path_courses');
    await connection.execute('DELETE FROM learning_paths');
    console.log('Cleanup complete.\n');

    // Get all job profiles
    const [jobProfiles] = await connection.execute(`
      SELECT id, title FROM job_profiles
      ORDER BY id
    `);

    console.log(`Processing ${jobProfiles.length} job profiles...`);

    for (const job of jobProfiles) {
      console.log(`\nGenerating learning paths for: ${job.title}`);
      
      // Get required skills for this job
      const [jobSkills] = await connection.execute(`
        SELECT 
          js.skill_id,
          js.is_essential,
          js.skill_level,
          s.preferred_label as skill_name
        FROM job_skills js
        JOIN skills s ON js.skill_id = s.id
        WHERE js.job_id = ?
        ORDER BY js.is_essential DESC, js.skill_level DESC
      `, [job.id]);

      if (jobSkills.length === 0) {
        console.log(`  No skills found for job ${job.title}`);
        continue;
      }

      // Get courses that teach these skills
      const skillIds = jobSkills.map(s => s.skill_id);
      const placeholders = skillIds.map(() => '?').join(',');
      
      const [coursesWithSkills] = await connection.execute(`
        SELECT 
          c.id as course_id,
          c.name as course_name,
          cs.skill_id,
          cs.rerank_score,
          js.is_essential,
          js.skill_level
        FROM courses c
        JOIN course_skills cs ON c.id = cs.course_id
        JOIN job_skills js ON cs.skill_id = js.skill_id AND js.job_id = ?
        WHERE cs.skill_id IN (${placeholders})
        ORDER BY js.is_essential DESC, cs.rerank_score DESC
      `, [job.id, ...skillIds]);

      if (coursesWithSkills.length === 0) {
        console.log(`  No courses found that teach skills for ${job.title}`);
        continue;
      }

      // Generate learning paths using set cover algorithm
      const paths = generateOptimalPaths(job, jobSkills, coursesWithSkills);
      
      // Save paths to database
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const pathName = paths.length > 1 
          ? `${job.title} Learning Path - Option ${i + 1}`
          : `${job.title} Learning Path`;

        // Insert learning path
        const [result] = await connection.execute(`
          INSERT INTO learning_paths (
            job_id, 
            name, 
            description, 
            essential_skills_match_percent, 
            total_skills_match_percent,
            score
          ) VALUES (?, ?, ?, ?, ?, ?)
        `, [
          job.id,
          pathName,
          `Curated learning path for ${job.title} covering ${path.coveredSkills.size} out of ${jobSkills.length} required skills`,
          path.essentialMatch,
          path.totalMatch,
          path.score
        ]);

        const pathId = result.insertId;

        // Insert courses for this path
        for (let j = 0; j < path.courses.length; j++) {
          await connection.execute(`
            INSERT INTO learning_path_courses (
              learning_path_id,
              course_id,
              sequence_order,
              is_prerequisite
            ) VALUES (?, ?, ?, ?)
          `, [
            pathId,
            path.courses[j].course_id,
            j + 1,
            j === 0 // First course is prerequisite
          ]);
        }

        // Insert skill coverage details
        for (const skillId of path.coveredSkills) {
          await connection.execute(`
            INSERT INTO learning_path_skill_coverage (
              learning_path_id,
              skill_id,
              is_covered,
              coverage_score
            ) VALUES (?, ?, ?, ?)
          `, [
            pathId,
            skillId,
            true,
            100.00
          ]);
        }

        console.log(`  Created path "${pathName}" with ${path.courses.length} courses (${path.essentialMatch}% essential, ${path.totalMatch}% total coverage)`);
      }
    }

    console.log('\nLearning path generation complete!');

  } finally {
    await connection.end();
  }
}

function generateOptimalPaths(job, jobSkills, coursesWithSkills) {
  // Group courses by the skills they teach
  const courseMap = new Map();
  const skillToCourses = new Map();
  
  coursesWithSkills.forEach(row => {
    if (!courseMap.has(row.course_id)) {
      courseMap.set(row.course_id, {
        course_id: row.course_id,
        course_name: row.course_name,
        skills: new Set(),
        essentialSkills: new Set(),
        additionalSkills: new Set(),
        score: 0
      });
    }
    
    const course = courseMap.get(row.course_id);
    course.skills.add(row.skill_id);
    if (row.is_essential) {
      course.essentialSkills.add(row.skill_id);
    } else {
      course.additionalSkills.add(row.skill_id);
    }
    // Weight score by essential skills and rerank score
    course.score += (row.is_essential ? 3 : 1) * (row.rerank_score || 0.5);
    
    if (!skillToCourses.has(row.skill_id)) {
      skillToCourses.set(row.skill_id, []);
    }
    skillToCourses.get(row.skill_id).push(row.course_id);
  });

  // Get essential and additional skills
  const essentialSkills = new Set(jobSkills.filter(s => s.is_essential).map(s => s.skill_id));
  const additionalSkills = new Set(jobSkills.filter(s => !s.is_essential).map(s => s.skill_id));
  
  if (essentialSkills.size === 0) {
    console.log(`  No essential skills defined for ${job.title}`);
    return [];
  }

  // Use simulated annealing to generate diverse learning paths
  return generatePathsWithSimulatedAnnealing(courseMap, essentialSkills, additionalSkills, jobSkills.length);
}

function generatePathsWithSimulatedAnnealing(courseMap, essentialSkills, additionalSkills, totalSkills) {
  const courses = Array.from(courseMap.values());
  const allSkills = new Set([...essentialSkills, ...additionalSkills]);
  const maxPaths = 10; // Generate up to 10 diverse paths
  const maxIterations = 1000;
  const maxCourses = 10;
  
  const paths = [];
  
  for (let pathIndex = 0; pathIndex < maxPaths; pathIndex++) {
    let bestPath = null;
    let bestFitness = -Infinity;
    
    // Start with a random valid path
    let currentPath = generateRandomPath(courses, essentialSkills, additionalSkills, maxCourses);
    let currentFitness = calculateFitness(currentPath, essentialSkills, additionalSkills, totalSkills);
    
    // Simulated annealing parameters
    let temperature = 100;
    const coolingRate = 0.95;
    const minTemperature = 0.1;
    
    for (let iteration = 0; iteration < maxIterations && temperature > minTemperature; iteration++) {
      // Generate a neighbor path by making a small modification
      const neighborPath = generateNeighborPath(currentPath, courses, essentialSkills, additionalSkills, maxCourses);
      const neighborFitness = calculateFitness(neighborPath, essentialSkills, additionalSkills, totalSkills);
      
      // Accept or reject the neighbor
      const deltaFitness = neighborFitness - currentFitness;
      if (deltaFitness > 0 || Math.random() < Math.exp(deltaFitness / temperature)) {
        currentPath = neighborPath;
        currentFitness = neighborFitness;
        
        // Update best if this is better
        if (currentFitness > bestFitness) {
          bestPath = [...currentPath];
          bestFitness = currentFitness;
        }
      }
      
      // Cool down
      temperature *= coolingRate;
    }
    
    if (bestPath && bestPath.length > 0) {
      // Ensure essential skills come first
      const sortedPath = sortPathByEssentialSkills(bestPath, essentialSkills);
      
      // Calculate final metrics
      const pathMetrics = calculatePathMetrics(sortedPath, essentialSkills, additionalSkills, totalSkills);
      
      // Calculate final fitness score for this path
      const finalScore = calculateFitness(sortedPath, essentialSkills, additionalSkills, totalSkills);
      
      // Add all valid paths - no hard filter on essential skills coverage
      paths.push({
        courses: sortedPath,
        coveredSkills: pathMetrics.coveredSkills,
        essentialMatch: pathMetrics.essentialMatch,
        totalMatch: pathMetrics.totalMatch,
        score: finalScore
      });
    }
  }
  
  // Remove duplicate paths and sort by fitness
  const uniquePaths = removeDuplicatePaths(paths);
  uniquePaths.sort((a, b) => {
    // Prioritize essential skills coverage, then total coverage, then fewer courses
    const aScore = a.essentialMatch * 100 + a.totalMatch - a.courses.length;
    const bScore = b.essentialMatch * 100 + b.totalMatch - b.courses.length;
    return bScore - aScore;
  });
  
  return uniquePaths.slice(0, 10); // Return top 10 paths
}

function generateRandomPath(courses, essentialSkills, additionalSkills, maxCourses) {
  const path = [];
  const coveredSkills = new Set();
  const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);
  
  for (const course of shuffledCourses) {
    if (path.length >= maxCourses) break;
    
    // Check if this course adds any new skills
    const newSkills = [...course.skills].filter(s => 
      (essentialSkills.has(s) || additionalSkills.has(s)) && !coveredSkills.has(s)
    );
    
    if (newSkills.length > 0) {
      path.push(course);
      newSkills.forEach(s => coveredSkills.add(s));
    }
  }
  
  return path;
}

function generateNeighborPath(currentPath, allCourses, essentialSkills, additionalSkills, maxCourses) {
  const operations = ['add', 'remove', 'replace'];
  const operation = operations[Math.floor(Math.random() * operations.length)];
  
  let newPath = [...currentPath];
  
  switch (operation) {
    case 'add':
      if (newPath.length < maxCourses) {
        const availableCourses = allCourses.filter(c => 
          !newPath.some(p => p.course_id === c.course_id)
        );
        if (availableCourses.length > 0) {
          const randomCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
          newPath.push(randomCourse);
        }
      }
      break;
      
    case 'remove':
      if (newPath.length > 1) {
        const randomIndex = Math.floor(Math.random() * newPath.length);
        newPath.splice(randomIndex, 1);
      }
      break;
      
    case 'replace':
      if (newPath.length > 0) {
        const randomIndex = Math.floor(Math.random() * newPath.length);
        const availableCourses = allCourses.filter(c => 
          !newPath.some(p => p.course_id === c.course_id)
        );
        if (availableCourses.length > 0) {
          const randomCourse = availableCourses[Math.floor(Math.random() * availableCourses.length)];
          newPath[randomIndex] = randomCourse;
        }
      }
      break;
  }
  
  return newPath;
}

function calculateFitness(path, essentialSkills, additionalSkills, totalSkills) {
  if (!path || path.length === 0) return -Infinity;
  
  const coveredSkills = new Set();
  const skillDuplicates = new Map(); // Track how many times each skill is taught
  
  // Calculate skill coverage and duplicates
  for (const course of path) {
    for (const skillId of course.skills) {
      if (essentialSkills.has(skillId) || additionalSkills.has(skillId)) {
        coveredSkills.add(skillId);
        skillDuplicates.set(skillId, (skillDuplicates.get(skillId) || 0) + 1);
      }
    }
  }
  
  const coveredEssential = [...coveredSkills].filter(s => essentialSkills.has(s)).length;
  const coveredAdditional = [...coveredSkills].filter(s => additionalSkills.has(s)).length;
  
  // Calculate essential and non-essential skill coverage separately
  const essentialCoverage = essentialSkills.size > 0 ? coveredEssential / essentialSkills.size : 1;
  const nonEssentialCovered = coveredSkills.size - coveredEssential;
  const nonEssentialTotal = additionalSkills.size;
  const nonEssentialCoverage = nonEssentialTotal > 0 ? nonEssentialCovered / nonEssentialTotal : 0;
  
  const efficiencyPenalty = Math.max(0, path.length - 8) * 5; // Penalty for too many courses
  const coursePenalty = path.length * 2; // Additional penalty for more courses to break ties
  
  // Heavy penalty for skill duplicates
  let duplicatePenalty = 0;
  for (const [skillId, count] of skillDuplicates) {
    if (count > 1) {
      duplicatePenalty += (count - 1) * 200; // Very heavy penalty for duplicates
    }
  }
  
  // Bonus for covering all essential skills
  const essentialBonus = essentialCoverage >= 1.0 ? 50 : 0;
  
  const fitness = 
    essentialCoverage * 300 +     // Essential skills at 3x rate (was 100, now 300)
    nonEssentialCoverage * 100 +  // Non-essential skills at base rate
    essentialBonus -              // Bonus for 100% essential coverage
    efficiencyPenalty -           // Penalty for too many courses
    coursePenalty -               // Additional penalty for more courses (tiebreaker)
    duplicatePenalty;             // Heavy penalty for duplicates
  
  return fitness;
}

function sortPathByEssentialSkills(path, essentialSkills) {
  return path.sort((a, b) => {
    const aEssentialCount = [...a.essentialSkills].filter(s => essentialSkills.has(s)).length;
    const bEssentialCount = [...b.essentialSkills].filter(s => essentialSkills.has(s)).length;
    
    if (aEssentialCount !== bEssentialCount) {
      return bEssentialCount - aEssentialCount; // More essential skills first
    }
    
    return b.score - a.score; // Then by course score
  });
}

function calculatePathMetrics(path, essentialSkills, additionalSkills, totalSkills) {
  const coveredSkills = new Set();
  
  for (const course of path) {
    for (const skillId of course.skills) {
      if (essentialSkills.has(skillId) || additionalSkills.has(skillId)) {
        coveredSkills.add(skillId);
      }
    }
  }
  
  const coveredEssential = [...coveredSkills].filter(s => essentialSkills.has(s)).length;
  const essentialMatch = essentialSkills.size > 0 
    ? Math.round((coveredEssential / essentialSkills.size) * 100)
    : 100;
  const totalMatch = Math.round((coveredSkills.size / totalSkills) * 100);
  
  return {
    coveredSkills,
    essentialMatch,
    totalMatch
  };
}

function removeDuplicatePaths(paths) {
  const unique = [];
  
  for (const path of paths) {
    const courseIds = path.courses.map(c => c.course_id).sort().join(',');
    const isDuplicate = unique.some(p => 
      p.courses.map(c => c.course_id).sort().join(',') === courseIds
    );
    
    if (!isDuplicate) {
      unique.push(path);
    }
  }
  
  return unique;
}

// Run the script
generateLearningPaths().catch(console.error);