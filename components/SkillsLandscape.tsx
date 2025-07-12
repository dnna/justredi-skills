import { Container } from '@/components/Container';
import Link from 'next/link';

export function SkillsLandscape({ skills }: { skills: any[] }) {
  const maxJobs = Math.max(...skills.map((s) => s.job_count), 0);

  return (
    <section className="py-20 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Το Τοπίο των Δεξιοτήτων στην Ελλάδα
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Οι πιο περιζήτητες ψηφιακές δεξιότητες στην αγορά εργασίας, με βάση τα διαθέσιμα
            εργασιακά προφίλ.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="space-y-4">
            {skills.map((skill) => (
              <div key={skill.id} className="group">
                <Link href={`/skills/${skill.id}`}>
                  <div className="mb-1 flex items-center">
                    <h3 className="text-sm font-semibold text-gray-800 transition-colors group-hover:text-green-600">
                      {skill.preferred_label}
                    </h3>
                    <p className="ml-auto text-sm text-gray-500">{skill.job_count} προφίλ</p>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-green-500 transition-colors group-hover:bg-green-600"
                      style={{ width: `${(skill.job_count / maxJobs) * 100}%` }}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
