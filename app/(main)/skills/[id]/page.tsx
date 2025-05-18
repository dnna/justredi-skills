import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkill, getRelatedSkills, getRelatedJobProfiles } from '@/lib/db';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

// Define the type for skill page params
type SkillParams = {
  id: string;
};

// Use the Next.js specific page props pattern for Next.js 15
type Props = {
  params: Promise<SkillParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SkillPage({ params }: Props) {
  // Resolve the params promise to get the id
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const skill = await getSkill(id);

  if (!skill) {
    notFound();
  }

  // Get related skills and job profiles
  const relatedSkillsResult = await getRelatedSkills(skill.id);
  const relatedSkills = Array.isArray(relatedSkillsResult) ? relatedSkillsResult : [];

  const jobProfilesResult = await getRelatedJobProfiles([skill.id]);
  const jobProfiles = Array.isArray(jobProfilesResult) ? jobProfilesResult : [];

  // Parse alt_labels if it exists
  let altLabels: string[] = [];
  if (skill.alt_labels) {
    try {
      altLabels = skill.alt_labels.split(',').map((label: string) => label.trim());
    } catch (e) {
      // If parsing fails, keep it as an empty array
      // eslint-disable-next-line no-console
      console.error('Error parsing alt_labels:', e);
    }
  }

  return (
    <Container className="mb-24 mt-16">
      <div className="mb-8">
        <Link href="/skills" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
          {'← skills'}
        </Link>

        {/* Breadcrumb-like navigation could be added here */}
      </div>

      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        {skill.preferred_label}
      </h1>

      <div className="mt-6 text-lg leading-8 text-gray-600">
        <p>{skill.description}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        {skill.skill_type && (
          <div className="inline-flex items-center rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
            <span className="mr-2">Type:</span>
            {skill.skill_type === 'knowledge'
              ? 'Knowledge'
              : skill.skill_type === 'skill/competence'
                ? 'Skill/Competence'
                : skill.skill_type}
          </div>
        )}

        {skill.skill_group && (
          <div className="inline-flex items-center rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700">
            <span className="mr-2">Group:</span>
            {skill.skill_group}
          </div>
        )}

        {skill.skill_category && (
          <div className="inline-flex items-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
            <span className="mr-2">Category:</span>
            {skill.skill_category}
          </div>
        )}

        {skill.hierarchy_level !== undefined && (
          <div className="inline-flex items-center rounded-md bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700">
            <span className="mr-2">Hierarchy Level:</span>
            {skill.hierarchy_level}
          </div>
        )}
      </div>

      {/* Display parent skill if exists */}
      {skill.parentSkill && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Parent Skill</h3>
          <div className="mt-2">
            <Link
              href={`/skills/${skill.parentSkill.id}`}
              className="inline-flex items-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
            >
              {skill.parentSkill.preferred_label}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="ml-1 h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      )}

      {/* Display child skills if this is a broader skill */}
      {skill.childSkills && skill.childSkills.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900">Specialized Skills</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {skill.childSkills.slice(0, 5).map((childSkill: any) => (
              <Link
                key={childSkill.id}
                href={`/skills/${childSkill.id}`}
                className="inline-flex items-center rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
              >
                {childSkill.preferred_label}
              </Link>
            ))}
            {skill.childSkills.length > 5 && (
              <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800">
                +{skill.childSkills.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {altLabels.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">Alternative labels</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {altLabels.map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Related skills</h2>

        {relatedSkills.length > 0 ? (
          <div className="mt-6">
            {(() => {
              // Group related skills by relation type first, then by skill_group
              const skillsByRelation: any = {
                parent: {
                  title: 'Parent Skill',
                  skills: [],
                  priority: 1,
                },
                sibling: {
                  title: 'Similar Skills',
                  skills: [],
                  priority: 2,
                },
                child: {
                  title: 'Specialized Skills',
                  skills: [],
                  priority: 3,
                },
                course: {
                  title: 'Skills from Same Courses',
                  skills: [],
                  priority: 4,
                },
                group: {
                  title: 'Skills in Same Group',
                  skills: [],
                  priority: 5,
                },
              };

              // Organize skills by relation type
              relatedSkills.forEach((skill: any) => {
                const relationType = skill.relation_type || 'group';
                if (skillsByRelation[relationType]) {
                  skillsByRelation[relationType].skills.push(skill);
                } else {
                  // Fallback for any other relation types
                  skillsByRelation.group.skills.push(skill);
                }
              });

              // Filter out empty relation types
              const nonEmptyRelations = Object.values(skillsByRelation)
                .filter((relation: any) => relation.skills.length > 0)
                .sort((a: any, b: any) => a.priority - b.priority);

              return (
                <div className="space-y-10">
                  {nonEmptyRelations.map((relation: any) => (
                    <div key={relation.title}>
                      <h3 className="mb-4 text-xl font-semibold text-gray-900">{relation.title}</h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {(() => {
                          // For parent skills, don't group them, just list them
                          if (relation.title === 'Parent Skill') {
                            return relation.skills.map((skill: any) => (
                              <div
                                key={skill.id}
                                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                              >
                                <Link
                                  href={`/skills/${skill.id}`}
                                  className="text-lg font-medium text-indigo-600 hover:text-indigo-800"
                                >
                                  {skill.preferred_label}
                                  {skill.skill_type === 'group' && (
                                    <span className="ml-2 rounded-full bg-purple-50 px-2 py-0.5 text-xs text-purple-700">
                                      Skill Group
                                    </span>
                                  )}
                                </Link>
                              </div>
                            ));
                          }

                          // Group other skills by skill_group
                          const skillsByGroup = relation.skills.reduce(
                            (acc: any, relatedSkill: any) => {
                              // Use "Other Skills" as default group if no group is specified
                              const group = relatedSkill.skill_group || 'Other Skills';
                              if (!acc[group]) {
                                acc[group] = [];
                              }
                              acc[group].push(relatedSkill);
                              return acc;
                            },
                            {}
                          );

                          // Sort groups by number of skills (most to least)
                          const sortedGroups = Object.keys(skillsByGroup).sort((a, b) => {
                            return skillsByGroup[b].length - skillsByGroup[a].length;
                          });

                          return sortedGroups.map((group) => (
                            <div
                              key={group}
                              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                            >
                              <h4 className="mb-4 text-lg font-semibold text-gray-900">{group}</h4>
                              <ul className="space-y-2">
                                {skillsByGroup[group]
                                  .sort((a: any, b: any) =>
                                    a.preferred_label.localeCompare(b.preferred_label)
                                  )
                                  .map((relatedSkill: any) => (
                                    <li key={relatedSkill.id}>
                                      <Link
                                        href={`/skills/${relatedSkill.id}`}
                                        className="text-indigo-600 hover:text-indigo-800"
                                      >
                                        • {relatedSkill.preferred_label}
                                        {relatedSkill.skill_type === 'knowledge' && (
                                          <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                            Knowledge
                                          </span>
                                        )}
                                        {relatedSkill.skill_type === 'skill/competence' && (
                                          <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                            Skill
                                          </span>
                                        )}
                                      </Link>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <p className="mt-4 text-gray-600">No related skills found.</p>
        )}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Learning Opportunities</h2>

        <div className="mt-6 space-y-8">
          {skill.courses && skill.courses.length > 0 ? (
            skill.courses.map((course: any) => (
              <div key={course.id} className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-900">
                  <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                    {course.courseName}
                  </Link>
                </h3>
                <p className="mt-2 text-sm text-gray-500">{course.institutionName}</p>
                {(course.retrieval_score || course.rerank_score) && (
                  <div className="mt-1 text-xs text-gray-400">
                    Match score:{' '}
                    {Math.round(((course.retrieval_score + course.rerank_score) / 2) * 100)}%
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No courses found for this skill.</p>
          )}
        </div>

        {skill.courses && skill.courses.length > 5 && (
          <div className="mt-8">
            <Button href="#" variant="solid" className="bg-black text-white hover:bg-gray-800">
              Show more
            </Button>
          </div>
        )}
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Job profiles</h2>
        <p className="mt-4 text-base text-gray-600">
          This skill is relevant to the following job profiles.
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
                  {job.skills.map((relatedSkillId: string) => {
                    // Check if it's the current skill
                    const isCurrentSkill = relatedSkillId === skill.id;
                    return (
                      <span
                        key={relatedSkillId}
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          isCurrentSkill
                            ? 'bg-indigo-100 text-indigo-700'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        {isCurrentSkill ? skill.preferred_label : 'Other skill'}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Button href="#" variant="solid" className="bg-black text-white hover:bg-gray-800">
            Show more
          </Button>
        </div>
      </div>
    </Container>
  );
}
