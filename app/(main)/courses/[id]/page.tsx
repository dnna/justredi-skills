import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, getRelatedJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';
import { CourseContent } from '@/components/CourseContent';

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
        {!hasStructuredContent && (
          <p>
            {course.description ||
              'This course is part of our education catalog. Learn more about the specific skills and knowledge you can gain by enrolling.'}
          </p>
        )}
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
                      <ul className="space-y-2">
                        {/* Sort skills by digital first, then alphabetically */}
                        {skillsByGroup[group]
                          .sort((a: any, b: any) => {
                            // Sort by digital skills first, then alphabetically
                            if (Boolean(a.is_digital_skill) && !Boolean(b.is_digital_skill))
                              return -1;
                            if (!Boolean(a.is_digital_skill) && Boolean(b.is_digital_skill))
                              return 1;
                            return a.preferred_label.localeCompare(b.preferred_label);
                          })
                          .map((skill: any) => (
                            <li key={skill.id}>
                              <Link
                                href={`/skills/${skill.id}`}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                • {skill.preferred_label}
                                {Boolean(skill.is_digital_skill) && (
                                  <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                                    Digital
                                  </span>
                                )}
                                {skill.skill_type === 'knowledge' && (
                                  <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                    Knowledge
                                  </span>
                                )}
                                {skill.skill_type === 'skill/competence' && (
                                  <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                    Skill
                                  </span>
                                )}
                              </Link>
                            </li>
                          ))}
                      </ul>
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
            className="inline-flex justify-center items-center rounded-lg py-2 px-3 text-sm font-semibold transition-colors bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            View Course →
          </a>
        </div>
      )}

      {jobProfiles && jobProfiles.length > 0 && (
        <div className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Job profiles</h2>
          <p className="mt-4 text-base text-gray-600">
            The skills learned from this course are applicable to the below job profiles.
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
                  <p className="text-sm font-medium text-gray-600">Related skills:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
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
                      job.skills.map((skillId: string) => {
                        const skill = course.skills.find((s: any) => s.id === skillId);
                        return skill ? (
                          <span
                            key={skill.id}
                            className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                          >
                            {skill.preferred_label}
                          </span>
                        ) : null;
                      })
                    ) : (
                      <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600">
                        Job profile details
                      </span>
                    )}
                  </div>
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
