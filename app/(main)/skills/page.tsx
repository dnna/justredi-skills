import Link from 'next/link';
import { getAllSkills } from '@/lib/db';
import { Container } from '@/components/Container';

export default async function SkillsPage() {
  const skillsResult = await getAllSkills(100, 0);
  const skills = Array.isArray(skillsResult) ? skillsResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Skills</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Explore skills that can enhance your career prospects and match them with suitable learning
        opportunities.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {skills.length > 0 ? (
          skills.map((skill: any) => (
            <div
              key={skill.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                <Link href={`/skills/${skill.id}`} className="hover:text-indigo-600">
                  {skill.preferred_label}
                </Link>
              </h3>

              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{skill.description}</p>

              <div className="mt-4">
                <Link
                  href={`/skills/${skill.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Learn more →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500">No skills found.</div>
        )}
      </div>
    </Container>
  );
}
