import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobProfile } from '@/lib/db';
import { Container } from '@/components/Container';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface JobProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobProfilePage({ params }: JobProfilePageProps) {
  const { id } = await params;
  const jobProfile = await getJobProfile(id);

  if (!jobProfile) {
    notFound();
  }

  // Separate essential and optional skills
  const essentialSkills = jobProfile.skills?.filter((skill: any) => skill.is_essential) || [];
  const optionalSkills = jobProfile.skills?.filter((skill: any) => !skill.is_essential) || [];

  return (
    <Container className="mb-24 mt-16">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/job-profiles" className="text-gray-500 hover:text-gray-700">
              Job Profiles
            </Link>
          </li>
          <li>
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li className="font-medium text-gray-900">{jobProfile.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {jobProfile.title}
        </h1>
        <p className="mt-4 max-w-4xl text-lg leading-8 text-gray-600">{jobProfile.description}</p>
        {jobProfile.alt_titles && (
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Also known as:</span> {jobProfile.alt_titles}
          </div>
        )}
      </div>

      {/* Learning Paths - Visual Journey */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Learning Paths</h2>
          <p className="mt-2 text-lg text-gray-600">
            Choose your journey to master the skills needed for this role
          </p>
        </div>

        {jobProfile.learningPaths && jobProfile.learningPaths.length > 0 ? (
          <div className="space-y-12">
            {jobProfile.learningPaths.map((path: any, pathIndex: number) => (
              <div
                key={path.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
              >
                {/* Path Header with Visual Progress */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{path.name}</h3>
                      <p className="mt-1 text-gray-600">{path.description}</p>
                    </div>
                  </div>

                  {/* Visual Skill Coverage */}
                  <div className="mt-6 grid grid-cols-2 gap-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Essential Skills Coverage
                        </span>
                        <span className="text-sm font-bold text-red-600">
                          {path.essential_skills_match_percent}% (
                          {path.covered_essential_skills || 0}/{path.total_essential_skills || 0})
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                          style={{ width: `${path.essential_skills_match_percent}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Non-Essential Skills Coverage
                        </span>
                        <span className="text-sm font-bold text-indigo-600">
                          {path.total_non_essential_skills > 0
                            ? Math.round(
                                (path.covered_non_essential_skills /
                                  path.total_non_essential_skills) *
                                  100
                              )
                            : 0}
                          % ({path.covered_non_essential_skills || 0}/
                          {path.total_non_essential_skills || 0})
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{
                            width: `${
                              path.total_non_essential_skills > 0
                                ? Math.round(
                                    (path.covered_non_essential_skills /
                                      path.total_non_essential_skills) *
                                      100
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Journey - Horizontal Layout */}
                <div className="p-6">
                  <h4 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Learning Journey - {path.courses.length} Steps
                  </h4>

                  {/* Course Sequence */}
                  <div className="space-y-6">
                    {/* Essential Skills Section */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasEssentialPhase = essentialCompleteIndex >= 0;
                      const essentialCourses = hasEssentialPhase
                        ? path.courses.slice(0, essentialCompleteIndex + 1)
                        : path.courses;

                      return (
                        essentialCourses.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-3">
                              {essentialCourses.map((course: any, courseIndex: number) => (
                                <div key={course.id} className="flex items-center">
                                  {/* Course Card */}
                                  <div
                                    className="min-w-0 flex-shrink-0 rounded-lg border border-red-200 bg-red-50 p-3 transition-colors hover:bg-red-100"
                                    style={{ maxWidth: '280px' }}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-500">
                                        <span className="text-xs font-bold text-white">
                                          {courseIndex + 1}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <Link
                                          href={`/courses/${course.id}`}
                                          className="block truncate text-sm font-medium text-gray-900 hover:text-red-600"
                                          title={course.name}
                                        >
                                          {course.name}
                                        </Link>
                                        <p className="truncate text-xs text-gray-500">
                                          {course.institution_name}
                                        </p>

                                        {/* Skills gained */}
                                        {course.skills && course.skills.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              {course.skills.slice(0, 3).map((skill: any) => (
                                                <span
                                                  key={skill.id}
                                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                                    skill.is_essential
                                                      ? 'bg-red-100 text-red-700'
                                                      : 'bg-indigo-100 text-indigo-700'
                                                  }`}
                                                >
                                                  {skill.preferred_label}
                                                </span>
                                              ))}
                                              {course.skills.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                  +{course.skills.length - 3}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Arrow */}
                                  {courseIndex < essentialCourses.length - 1 && (
                                    <svg
                                      className="mx-2 h-4 w-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}

                    {/* Phase Transition Indicator - only show if there are courses after the essential phase */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasCoursesAfterEssential =
                        essentialCompleteIndex >= 0 &&
                        essentialCompleteIndex < path.courses.length - 1;
                      return (
                        hasCoursesAfterEssential && (
                          <div className="my-6">
                            <div className="flex items-center justify-center">
                              <div className="h-px flex-1 bg-gray-300"></div>
                              <div
                                className={`rounded-full border px-4 py-2 ${
                                  path.essential_skills_match_percent >= 100
                                    ? 'border-green-300 bg-green-100'
                                    : 'border-yellow-300 bg-yellow-100'
                                }`}
                              >
                                <div
                                  className={`flex items-center text-sm font-medium ${
                                    path.essential_skills_match_percent >= 100
                                      ? 'text-green-800'
                                      : 'text-yellow-800'
                                  }`}
                                >
                                  <svg
                                    className="mr-2 h-4 w-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4"
                                    />
                                  </svg>
                                  {path.essential_skills_match_percent >= 100
                                    ? 'All Essential Skills Complete'
                                    : 'Additional Skills'}
                                </div>
                              </div>
                              <div className="h-px flex-1 bg-gray-300"></div>
                            </div>
                          </div>
                        )
                      );
                    })()}

                    {/* Additional Skills Section */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasAdditionalPhase =
                        essentialCompleteIndex >= 0 &&
                        essentialCompleteIndex < path.courses.length - 1;
                      const additionalCourses = hasAdditionalPhase
                        ? path.courses.slice(essentialCompleteIndex + 1)
                        : [];

                      return (
                        additionalCourses.length > 0 && (
                          <div>
                            <div className="flex flex-wrap gap-3">
                              {additionalCourses.map((course: any, courseIndex: number) => (
                                <div key={course.id} className="flex items-center">
                                  {/* Course Card */}
                                  <div
                                    className="min-w-0 flex-shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 p-3 transition-colors hover:bg-indigo-100"
                                    style={{ maxWidth: '280px' }}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500">
                                        <span className="text-xs font-bold text-white">
                                          {essentialCompleteIndex + 2 + courseIndex}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <Link
                                          href={`/courses/${course.id}`}
                                          className="block truncate text-sm font-medium text-gray-900 hover:text-indigo-600"
                                          title={course.name}
                                        >
                                          {course.name}
                                        </Link>
                                        <p className="truncate text-xs text-gray-500">
                                          {course.institution_name}
                                        </p>

                                        {/* Skills gained */}
                                        {course.skills && course.skills.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              {course.skills.slice(0, 3).map((skill: any) => (
                                                <span
                                                  key={skill.id}
                                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                                    skill.is_essential
                                                      ? 'bg-red-100 text-red-700'
                                                      : 'bg-indigo-100 text-indigo-700'
                                                  }`}
                                                >
                                                  {skill.preferred_label}
                                                </span>
                                              ))}
                                              {course.skills.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                  +{course.skills.length - 3}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Arrow */}
                                  {courseIndex < additionalCourses.length - 1 && (
                                    <svg
                                      className="mx-2 h-4 w-4 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-gray-50 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No learning paths available yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-500">
              We're working on creating curated learning paths for this job profile. Check back
              soon!
            </p>
          </div>
        )}
      </div>

      {/* Detailed Skills Section */}
      <div id="skills-detail" className="rounded-xl bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">All Required Skills</h2>

        {jobProfile.skills && jobProfile.skills.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {essentialSkills.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
                  Essential Skills ({essentialSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {essentialSkills.map((skill: any) => (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        skill.is_digital_skill
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                      title={skill.description}
                    >
                      {skill.preferred_label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {optionalSkills.length > 0 && (
              <div>
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700">
                  Additional Skills ({optionalSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {optionalSkills.map((skill: any) => (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className={`inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        skill.is_digital_skill
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={skill.description}
                    >
                      {skill.preferred_label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No specific skills have been mapped to this job profile yet.
          </p>
        )}
      </div>
    </Container>
  );
}
