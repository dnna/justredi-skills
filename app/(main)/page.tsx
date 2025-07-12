import { HeroSection } from '@/components/HeroSection';
import { InstitutionsList } from '@/components/Reviews';
import { ExploreByField } from '@/components/ExploreByField';
import { SkillsLandscape } from '@/components/SkillsLandscape';
import { getJobCategories, getTopInDemandDigitalSkills, getAllInstitutions } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const results = await Promise.all([
    getJobCategories(),
    getTopInDemandDigitalSkills(5),
    getAllInstitutions(12, 0),
  ]);

  const jobCategories = Array.isArray(results[0]) ? results[0] : [];
  const topSkills = Array.isArray(results[1]) ? results[1] : [];
  const institutions = Array.isArray(results[2]) ? results[2] : [];

  return (
    <>
      <HeroSection />
      <ExploreByField categories={jobCategories} />
      <SkillsLandscape skills={topSkills} />
      <InstitutionsList institutions={institutions} />
    </>
  );
}
