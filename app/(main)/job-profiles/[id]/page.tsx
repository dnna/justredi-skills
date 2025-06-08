import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobProfile } from '@/lib/db';
import { Container } from '@/components/Container';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface JobProfilePageProps {
  params: {
    id: string;
  };
}

export default async function JobProfilePage({ params }: JobProfilePageProps) {
  const jobProfile = await getJobProfile(params.id);

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
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              {jobProfile.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {jobProfile.isco_group && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                  ISCO: {jobProfile.isco_group}
                </span>
              )}

              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-500">Level:</span>
                <div className="flex space-x-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-3 w-3 rounded-full ${
                        level <= jobProfile.hierarchy_level ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-500">
                  (
                  {jobProfile.hierarchy_level === 1
                    ? 'Senior'
                    : jobProfile.hierarchy_level === 2
                      ? 'Mid-level'
                      : 'Entry-level'}
                  )
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-6 text-lg leading-8 text-gray-600">{jobProfile.description}</p>

        {/* Alternative titles */}
        {jobProfile.alt_titles && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900">Also known as:</h3>
            <p className="mt-1 text-sm text-gray-600">{jobProfile.alt_titles}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Skills Section */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Skills</h2>

          {jobProfile.skills && jobProfile.skills.length > 0 ? (
            <div className="space-y-6">
              {/* Essential Skills */}
              {essentialSkills.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
                    <span className="mr-2">Essential Skills</span>
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                      {essentialSkills.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {essentialSkills.map((skill: any) => (
                      <Link
                        key={skill.id}
                        href={`/skills/${skill.id}`}
                        className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 transition-colors hover:border-red-300 hover:bg-red-100"
                        title={skill.description}
                      >
                        {skill.preferred_label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Skills */}
              {optionalSkills.length > 0 && (
                <div>
                  <h3 className="mb-3 flex items-center text-lg font-semibold text-gray-900">
                    <span className="mr-2">Additional Skills</span>
                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                      {optionalSkills.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {optionalSkills.map((skill: any) => (
                      <Link
                        key={skill.id}
                        href={`/skills/${skill.id}`}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-100"
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
            <div className="py-8 text-center text-gray-500">
              No specific skills have been mapped to this job profile yet.
            </div>
          )}
        </div>

        {/* Learning Paths Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Learning Paths</h2>

          {/* Recommended Courses */}
          {jobProfile.courses && jobProfile.courses.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Recommended Courses</h3>
              {jobProfile.courses.map((course: any) => (
                <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <h4 className="font-medium text-gray-900">
                    <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                      {course.courseName}
                    </Link>
                  </h4>
                  <p className="mt-1 text-sm text-gray-600">{course.institutionName}</p>
                  <div className="mt-2 flex items-center">
                    <span className="text-xs text-gray-500">Skills match:</span>
                    <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                      {course.matching_skills} skills
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <h3 className="mt-4 text-sm font-medium text-gray-900">No courses found</h3>
              <p className="mt-2 text-sm text-gray-500">
                Courses that teach the required skills for this job profile will appear here.
              </p>
            </div>
          )}

          {/* Career Path Info */}
          <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="text-sm font-medium text-blue-900">Career Development</h3>
            <p className="mt-2 text-sm text-blue-700">
              This is a{' '}
              {jobProfile.hierarchy_level === 1
                ? 'senior-level'
                : jobProfile.hierarchy_level === 2
                  ? 'mid-level'
                  : 'entry-level'}{' '}
              position. Focus on developing the essential skills first, then expand into additional
              skills to advance your career.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
