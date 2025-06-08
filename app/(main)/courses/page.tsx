import Link from 'next/link';
import { getAllCoursesWithJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';
import { SkillTags } from '@/components/SkillTags';
import { FaBriefcase, FaExternalLinkAlt } from 'react-icons/fa';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const coursesResult = await getAllCoursesWithJobProfiles(50, 0);
  const courses = Array.isArray(coursesResult) ? coursesResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Courses</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Browse our catalog of courses to find learning opportunities that match your interests and
        career goals.
      </p>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div
              key={course.id}
              className="relative rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                      {course.courseName}
                    </Link>
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{course.institutionName}</p>
                </div>

                {course.external_url && (
                  <a
                    href={course.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 text-gray-400 transition-colors hover:text-indigo-600"
                  >
                    <FaExternalLinkAlt className="h-4 w-4" />
                  </a>
                )}
              </div>

              {/* Job Profile Matches */}
              {course.matching_job_profiles > 0 && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FaBriefcase className="h-4 w-4" />
                    <span>
                      Matches {course.matching_job_profiles} job profile
                      {course.matching_job_profiles !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {course.job_profile_titles && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                      {course.job_profile_titles}
                    </p>
                  )}
                </div>
              )}

              {/* Skills */}
              {course.skills && course.skills.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-xs font-medium text-gray-700">Key Skills:</h4>
                  <SkillTags
                    skills={course.skills}
                    maxDisplay={4}
                    size="sm"
                    variant="compact"
                    interactive={true}
                  />
                </div>
              )}

              {/* Course metadata */}
              <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                {course.language && <span className="capitalize">{course.language}</span>}
                {course.skill_count > 0 && <span>{course.skill_count} skills covered</span>}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2">
            <p className="py-10 text-center text-gray-500">No courses found.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
