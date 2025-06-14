import { CallToAction } from '@/components/CallToAction';
import { Faqs } from '@/components/Faqs';
import { Hero } from '@/components/Hero';
import { FeaturedLearningPaths } from '@/components/Pricing';
import { TopSkills } from '@/components/PrimaryFeatures';
import { InstitutionsList } from '@/components/Reviews';
import { FeaturedCourses } from '@/components/SecondaryFeatures';
import { HomePageWrapper } from './HomePageWrapper';
import {
  getAllCourses,
  getAllSkills,
  getAllInstitutions,
  getRelatedJobProfiles,
  getSkillsByGroup,
  getAllJobProfiles,
  getPopularSkills,
  getFeaturedLearningPaths,
  getFeaturedCourses,
} from '@/lib/db';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data from database
  const [
    learningPathsResult,
    skillsResult,
    institutionsResult,
    jobProfilesResult,
    featuredCoursesResult,
  ] = await Promise.all([
    getFeaturedLearningPaths(6),
    getAllSkills(6, 0),
    getAllInstitutions(10, 0),
    getAllJobProfiles(6, 0),
    getFeaturedCourses(6),
  ]);

  // Convert each query result to array
  const learningPaths = Array.isArray(learningPathsResult) ? learningPathsResult : [];
  const skills = Array.isArray(skillsResult) ? skillsResult : [];
  const institutions = Array.isArray(institutionsResult) ? institutionsResult : [];
  const jobProfiles = Array.isArray(jobProfilesResult) ? jobProfilesResult : [];
  const featuredCourses = Array.isArray(featuredCoursesResult) ? featuredCoursesResult : [];

  // Extract skill IDs and fetch related data for each skill
  const enrichedSkills: any[] = [];

  if (skills.length > 0) {
    // Process top 3 skills to include related data
    for (let i = 0; i < Math.min(skills.length, 3); i++) {
      const skill = skills[i] as any; // Type assertion to handle the id property safely

      if (!skill || !skill.id) {
        continue; // Skip if skill or skill.id is not available
      }

      // Fetch both job profiles and related skills
      // First try to get related job profiles using the new database query
      const [dbJobProfiles, relatedSkills] = await Promise.all([
        getRelatedJobProfiles([skill.id]),
        getSkillsByGroup(skill.id, 8),
      ]);

      // Add job profiles and related skills to the skill object
      const processedJobProfiles =
        Array.isArray(dbJobProfiles) && dbJobProfiles.length > 0
          ? dbJobProfiles
          : jobProfiles.slice(0, 3); // Use general job profiles as fallback

      const processedRelatedSkills = Array.isArray(relatedSkills) ? relatedSkills : [];

      enrichedSkills.push({
        ...skill,
        jobProfiles: processedJobProfiles,
        relatedSkills: processedRelatedSkills,
      });
    }
  }

  return (
    <HomePageWrapper>
      <Hero />
      <FeaturedLearningPaths learningPaths={learningPaths} />
      <FeaturedCourses courses={featuredCourses} />
      <CallToAction />
      <InstitutionsList institutions={institutions} />
      <TopSkills skills={enrichedSkills} />
      {/*<Faqs />*/}
    </HomePageWrapper>
  );
}
