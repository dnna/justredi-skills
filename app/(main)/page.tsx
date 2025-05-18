import { CallToAction } from '@/components/CallToAction';
import { Faqs } from '@/components/Faqs';
import { Hero } from '@/components/Hero';
import { FeaturedCourses } from '@/components/Pricing';
import { TopSkills } from '@/components/PrimaryFeatures';
import { InstitutionsList } from '@/components/Reviews';
import { FeaturedSkills } from '@/components/SecondaryFeatures';
import { HomePageWrapper } from './HomePageWrapper';
import {
  getAllCourses,
  getAllSkills,
  getAllInstitutions,
  getRelatedJobProfiles,
  getSkillsByGroup,
  getAllJobProfiles,
  getPopularSkills,
} from '@/lib/db';
import { getCategoryHierarchy } from '@/lib/categories';

export default async function Home() {
  // Fetch data from database
  const [courses, skills, institutions, jobProfiles, categories, popularSkills] = await Promise.all([
    getAllCourses(6, 0),
    getAllSkills(6, 0),
    getAllInstitutions(10, 0),
    getAllJobProfiles(6, 0),
    getCategoryHierarchy(),
    getPopularSkills(6),
  ]);

  // Extract skill IDs and fetch related data for each skill
  const enrichedSkills = [];

  if (skills.length > 0) {
    // Process top 3 skills to include related data
    for (let i = 0; i < Math.min(skills.length, 3); i++) {
      const skill = skills[i];

      // Fetch both job profiles and related skills
      // First try to get related job profiles using the new database query
      const [dbJobProfiles, relatedSkills] = await Promise.all([
        getRelatedJobProfiles([skill.id]),
        getSkillsByGroup(skill.id, 8),
      ]);

      // Add job profiles and related skills to the skill object
      enrichedSkills.push({
        ...skill,
        jobProfiles: dbJobProfiles.length > 0 ? dbJobProfiles : jobProfiles.slice(0, 3), // Use general job profiles as fallback
        relatedSkills,
      });
    }
  }

  return (
    <HomePageWrapper categories={categories}>
      <Hero />
      <FeaturedCourses courses={courses} />
      <FeaturedSkills skills={popularSkills} />
      <CallToAction />
      <InstitutionsList institutions={institutions} />
      <TopSkills skills={enrichedSkills} />
      {/*<Faqs />*/}
    </HomePageWrapper>
  );
}
