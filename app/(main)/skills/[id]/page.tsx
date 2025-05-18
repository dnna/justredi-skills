import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkill, getRelatedSkills, getRelatedJobProfiles } from '@/lib/db';
import { Layout } from '@/components/Layout';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

interface SkillPageProps {
  params: {
    id: string;
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  const skillId = params.id;
  const skill = await getSkill(skillId);

  if (!skill) {
    notFound();
  }

  // Get related skills and job profiles
  const relatedSkills = await getRelatedSkills(skill.id);
  const jobProfiles = await getRelatedJobProfiles([skill.id]);

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
    <Layout>
      <Container className="mt-16 mb-24">
        <div className="mb-8">
          <Link
            href="/skills"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
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

        {altLabels.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold tracking-tight text-gray-900">
              Alternative labels
            </h2>
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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Narrower skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedSkills.map((relatedSkill: any) => (
              <Link
                key={relatedSkill.id}
                href={`/skills/${relatedSkill.id}`}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                {relatedSkill.preferred_label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Learning Opportunities
          </h2>

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
              <Button href="#" variant="filled" className="bg-black text-white hover:bg-gray-800">
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
              <div key={job.id} className="group relative bg-gray-100 p-5 rounded-lg">
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
            <Button href="#" variant="filled" className="bg-black text-white hover:bg-gray-800">
              Show more
            </Button>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
