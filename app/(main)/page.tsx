import { CallToAction } from '@/components/CallToAction';
import { Faqs } from '@/components/Faqs';
import { Hero } from '@/components/Hero';
import { FeaturedLearningPaths } from '@/components/Pricing';
import { InstitutionsList } from '@/components/Reviews';
import { FeaturedCourses } from '@/components/SecondaryFeatures';
import { HomePageWrapper } from './HomePageWrapper';
import { getAllInstitutions, getFeaturedLearningPaths, getFeaturedCourses } from '@/lib/db';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data from database
  const [learningPathsResult, institutionsResult, featuredCoursesResult] = await Promise.all([
    getFeaturedLearningPaths(6),
    getAllInstitutions(10, 0),
    getFeaturedCourses(6),
  ]);

  // Convert each query result to array
  const learningPaths = Array.isArray(learningPathsResult) ? learningPathsResult : [];
  const institutions = Array.isArray(institutionsResult) ? institutionsResult : [];
  const featuredCourses = Array.isArray(featuredCoursesResult) ? featuredCoursesResult : [];

  return (
    <HomePageWrapper>
      <Hero />
      <FeaturedLearningPaths learningPaths={learningPaths} />
      <FeaturedCourses courses={featuredCourses} />
      <CallToAction />
      <InstitutionsList institutions={institutions} />
      {/*<Faqs />*/}
    </HomePageWrapper>
  );
}
