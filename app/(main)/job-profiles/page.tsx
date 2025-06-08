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
              <div className="mb-4 space-y-3">
                {/* Essential Skills */}
                {profile.skills.filter((skill: any) => skill.is_essential).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-gray-900">
                      Essential Skills (
                      {profile.skills.filter((skill: any) => skill.is_essential).length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills
                        .filter((skill: any) => skill.is_essential)
                        .map((skill: any) => {
                          // Determine styling based on essential status only
                          let className =
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ';

                          // Essential skills get red styling regardless of digital status
                          className += 'bg-red-50 text-red-800 border border-red-200';

                          return (
                            <span key={skill.id} className={className} title={skill.description}>
                              {!!skill.is_digital_skill && (
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                              )}
                              {skill.preferred_label}
                            </span>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Additional Skills */}
                {profile.skills.filter((skill: any) => !skill.is_essential).length > 0 && (
                  <div>
                    <h4 className="mb-2 text-xs font-medium text-gray-900">
                      Additional Skills (
                      {profile.skills.filter((skill: any) => !skill.is_essential).length}):
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {profile.skills
                        .filter((skill: any) => !skill.is_essential)
                        .map((skill: any) => {
                          // Determine styling based on essential status only
                          let className =
                            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ';

                          // Additional skills get gray styling regardless of digital status
                          className += 'bg-gray-50 text-gray-700 border border-gray-200';

                          return (
                            <span key={skill.id} className={className} title={skill.description}>
                              {!!skill.is_digital_skill && (
                                <svg
                                  className="mr-1 h-3 w-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                  />
                                </svg>
                              )}
                              {skill.preferred_label}
                            </span>
                          );
                        })}
                    </div>
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
