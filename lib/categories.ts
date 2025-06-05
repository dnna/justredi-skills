import { query } from './db';

export type CategoryItem = {
  id: string;
  name: string;
  skill_type?: 'knowledge' | 'skill/competence';
  is_digital_skill?: boolean;
  children?: CategoryItem[];
};

/**
 * Get the skill hierarchy data structured for the category modal
 * Modified to use a 2-level hierarchy instead of 3-levels
 */
export async function getCategoryHierarchy(): Promise<CategoryItem[]> {
  try {
    // Get top level skill groups (Level 1)
    const topLevelGroupsQuery = `
      SELECT DISTINCT skill_group as id, skill_group as name
      FROM skills
      WHERE skill_group IS NOT NULL
      ORDER BY skill_group
    `;

    const topLevelGroups = (await query(topLevelGroupsQuery, [])) as CategoryItem[];

    // For each top level group, get the skills directly (Level 2)
    for (const group of topLevelGroups) {
      const skillsQuery = `
        SELECT id, preferred_label as name, skill_type, is_digital_skill
        FROM skills
        WHERE skill_group = ?
        ORDER BY preferred_label
        LIMIT 50
      `;

      group.children = (await query(skillsQuery, [group.id])) as CategoryItem[];
    }

    return topLevelGroups;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return empty array if there's an error
    return [];
  }
}
