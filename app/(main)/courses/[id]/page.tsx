import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, getRelatedJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { CourseContent } from '@/components/CourseContent';
import { SkillTags } from '@/components/SkillTags';
import { FaRoute, FaBullseye, FaBriefcase } from 'react-icons/fa';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

// Define the type for course page params
type CourseParams = {
  id: string;
};

// Use the Next.js PageProps pattern for Next.js 15
type Props = {
  params: Promise<CourseParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CoursePage({ params, searchParams }: Props) {
  // Get the course ID directly from params
  const resolvedParams = await params;
  const courseId = resolvedParams.id;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  // Get job profiles related to the skills in this course
  const skillIds = course.skills.map((skill: any) => skill.id);
  const jobProfilesResult = await getRelatedJobProfiles(skillIds);
  const jobProfiles = Array.isArray(jobProfilesResult) ? jobProfilesResult : [];

  // Check if we have content from course_nodes
  const hasStructuredContent = course.content && course.content.length > 0;

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        {course.courseName}
      </h1>

      <div className="mt-6 text-lg leading-8 text-gray-600">
        {!hasStructuredContent && <p>{course.description}</p>}
      </div>

      <div className="mt-10">
        <div>
          <h3 className="font-semibold text-gray-900">Institution</h3>
          <Link
            href={`/institutions/${course.institution_id}`}
            className="text-indigo-600 hover:text-indigo-500"
          >
            {course.institutionName}
          </Link>
        </div>
      </div>

      {/* Course content section */}
      {hasStructuredContent && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Course Content</h2>
          <CourseContent content={course.content} />
        </div>
      )}

      <div className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Taught skills</h2>

        {course.skills.length > 0 ? (
          <div className="mt-6">
            {/* Group skills by skill_group */}
            {(() => {
              // First group all skills by their skill_group
              const skillsByGroup = course.skills.reduce((acc: any, skill: any) => {
                // Use "Other Skills" as default group if no group is specified
                const group = skill.skill_group || 'Other Skills';
                if (!acc[group]) {
                  acc[group] = [];
                }
                acc[group].push(skill);
                return acc;
              }, {});

              // Sort groups by number of skills (most to least)
              const sortedGroups = Object.keys(skillsByGroup).sort((a, b) => {
                return skillsByGroup[b].length - skillsByGroup[a].length;
              });

              return (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {sortedGroups.map((group) => (
                    <div
                      key={group}
                      className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                    >
                      <h3 className="mb-4 text-lg font-semibold text-gray-900">{group}</h3>
                      <SkillTags
                        skills={skillsByGroup[group].sort((a: any, b: any) => {
                          // Sort by digital skills first, then alphabetically
                          if (Boolean(a.is_digital_skill) && !Boolean(b.is_digital_skill))
                            return -1;
                          if (!Boolean(a.is_digital_skill) && Boolean(b.is_digital_skill)) return 1;
                          return a.preferred_label.localeCompare(b.preferred_label);
                        })}
                        maxDisplay={10}
                        size="sm"
                        interactive={true}
                      />
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No skills information available for this course.</p>
        )}
      </div>

      {course.external_url && (
        <div className="mt-8">
          <a
            href={course.external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            View Course →
          </a>
        </div>
      )}

      {/* Learning Paths */}
      {course.learningPaths && course.learningPaths.length > 0 && (
        <div className="mt-20">
          <div className="mb-6 flex items-center gap-3">
            <FaRoute className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Learning Paths</h2>
          </div>
          <p className="mt-4 text-base text-gray-600">
            This course is part of structured learning paths designed to help you achieve specific
            career goals.
          </p>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {course.learningPaths.map((path: any) => (
              <div
                key={path.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      <Link
                        href={`/job-profiles/${path.job_id}#learning-path-${path.id}`}
                        className="hover:text-indigo-600"
                      >
                        {path.name}
                      </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">For: {path.job_title}</p>
                  </div>
                  <FaBullseye className="mt-1 h-5 w-5 text-green-600" />
                </div>

                {path.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-gray-700">{path.description}</p>
                )}

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                  {path.essential_skills_match_percent && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-red-500"></div>
                      <span>
                        {Math.round(path.essential_skills_match_percent)}% essential skills
                      </span>
                    </div>
                  )}
                  {path.total_skills_match_percent && (
                    <div className="flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                      <span>{Math.round(path.total_skills_match_percent)}% total skills</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {jobProfiles && jobProfiles.length > 0 && (
        <div className="mt-20">
          <div className="mb-6 flex items-center gap-3">
            <FaBriefcase className="h-6 w-6 text-indigo-600" />
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Matching Job Profiles
            </h2>
          </div>
          <p className="mt-4 text-base text-gray-600">
            The skills learned from this course are applicable to the following job profiles.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {jobProfiles.map((job: any) => (
              <div key={job.id} className="group relative rounded-lg bg-gray-100 p-5">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900">
                  <Link href={`/job-profiles/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-600">Related skills:</p>
                  {job.skill_labels ? (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                      {job.skill_labels}
                    </span>
                  ) : job.matching_skills ? (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-600">
                      {job.matching_skills} matching skills
                    </span>
                  ) : job.skills ? (
                    // Legacy format - handle array of skill IDs
                    <SkillTags
                      skills={job.skills
                        .map((skillId: string) => {
                          const skill = course.skills.find((s: any) => s.id === skillId);
                          return skill || { id: skillId, preferred_label: 'Unknown skill' };
                        })
                        .filter(Boolean)}
                      maxDisplay={3}
                      size="sm"
                      variant="compact"
                      interactive={true}
                    />
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                      Job profile details
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {jobProfiles.length > 3 && (
            <div className="mt-10">
              <Button href="#" variant="solid" className="bg-black text-white hover:bg-gray-800">
                Show more
              </Button>
            </div>
          )}
        </div>
      )}
    </Container>
  );
}
