import Link from 'next/link';
import { getAllJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';
import { SkillTags } from '@/components/SkillTags';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

export default async function JobProfilesPage() {
  const jobProfilesResult = await getAllJobProfiles(100, 0);
  const jobProfiles = Array.isArray(jobProfilesResult) ? jobProfilesResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Job Profiles</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Explore career opportunities and job profiles. Each profile shows required skills and
        connects you to relevant learning paths to help you achieve your career goals.
      </p>

      {/* Summary statistics */}
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-center">
        <dt className="text-sm font-medium text-gray-500">Total Job Profiles</dt>
        <dd className="text-3xl font-bold text-gray-900">{jobProfiles.length}</dd>
      </div>

      {/* Job profiles grid */}
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {jobProfiles.map((profile: any) => (
          <div
            key={profile.id}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3">
              <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">
                <Link href={`/job-profiles/${profile.id}`} className="hover:text-indigo-600">
                  {profile.title}
                </Link>
              </h3>
            </div>

            <p className="mb-4 line-clamp-3 text-sm text-gray-500">{profile.description}</p>

            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-4 space-y-3">
                {/* Essential Skills */}
                {profile.skills.filter((skill: any) => skill.is_essential).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-gray-900">
                      Essential Skills (
                      {profile.skills.filter((skill: any) => skill.is_essential).length}):
                    </h4>
                    <SkillTags
                      skills={profile.skills.filter((skill: any) => skill.is_essential)}
                      maxDisplay={10}
                      size="sm"
                      colorScheme="red"
                      interactive={true}
                      variant="default"
                    />
                  </div>
                )}

                {/* Additional Skills */}
                {profile.skills.filter((skill: any) => !skill.is_essential).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-gray-900">
                      Additional Skills (
                      {profile.skills.filter((skill: any) => !skill.is_essential).length}):
                    </h4>
                    <SkillTags
                      skills={profile.skills.filter((skill: any) => !skill.is_essential)}
                      maxDisplay={8}
                      size="sm"
                      colorScheme="gray"
                      interactive={true}
                      variant="default"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ISCO Group */}
            {profile.isco_group && (
              <div className="mb-3">
                <span className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  ISCO: {profile.isco_group}
                </span>
              </div>
            )}

            {/* View details link */}
            <div className="flex justify-end">
              <Link
                href={`/job-profiles/${profile.id}`}
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                View details →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {jobProfiles.length === 0 && (
        <div className="mt-10 py-10 text-center text-gray-500">No job profiles found.</div>
      )}
    </Container>
  );
}
