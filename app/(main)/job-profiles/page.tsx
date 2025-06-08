import Link from 'next/link';
import { getAllJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';

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
              <div className="mb-4">
                <h4 className="mb-2 text-xs font-medium text-gray-900">
                  Skills ({profile.skills.length}):
                </h4>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.map((skill: any) => (
                    <span
                      key={skill.id}
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        skill.is_essential
                          ? 'border border-red-200 bg-red-50 text-red-800'
                          : 'border border-gray-200 bg-gray-50 text-gray-700'
                      }`}
                      title={skill.description}
                    >
                      {skill.preferred_label}
                    </span>
                  ))}
                </div>
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

            {/* Hierarchy level indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xs text-gray-500">Level:</span>
                <div className="ml-2 flex space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-2 w-2 rounded-full ${
                        level <= profile.hierarchy_level ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>

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
