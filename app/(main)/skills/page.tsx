import Link from 'next/link';
import { getAllSkills } from '@/lib/db';
import { Container } from '@/components/Container';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

export default async function SkillsPage() {
  const skillsResult = await getAllSkills(100, 0);
  const skills = Array.isArray(skillsResult) ? skillsResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Δεξιότητες</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Εξερευνήστε δεξιότητες που μπορούν να βελτιώσουν τις επαγγελματικές σας προοπτικές και
        συνδυάστέ τις με κατάλληλες ευκαιρίες μάθησης. Οι ψηφιακές δεξιότητες είναι ιδιαίτερα
        τονισμένες για να σας βοηθήσουν να εντοπίσετε τεχνολογικές ικανότητες.
      </p>

      {/* Digital skills info banner */}
      <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
              clipRule="evenodd"
            />
          </svg>
          <p className="ml-2 text-sm font-medium text-emerald-800">
            <span className="mr-2 inline-flex items-center rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
              Ψηφιακή
            </span>
            Οι δεξιότητες που σημειώνονται ως "Ψηφιακές" είναι τεχνολογικές ικανότητες που
            εντοπίζονται από το Ευρωπαϊκό πλαίσιο Δεξιοτήτων, Ικανοτήτων και Επαγγελμάτων (ESCO).
          </p>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {skills.length > 0 ? (
          skills.map((skill: any) => (
            <div
              key={skill.id}
              className={`rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${
                skill.is_digital_skill
                  ? 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  <Link href={`/skills/${skill.id}`} className="hover:text-indigo-600">
                    {skill.preferred_label}
                  </Link>
                </h3>
                {skill.is_digital_skill && (
                  <span className="ml-2 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-medium text-white">
                    <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ψηφιακή
                  </span>
                )}
              </div>

              <p className="mt-2 line-clamp-3 text-sm text-gray-500">{skill.description}</p>

              <div className="mt-4">
                <Link
                  href={`/skills/${skill.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Μάθετε περισσότερα →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500">
            Δεν βρέθηκαν δεξιότητες.
          </div>
        )}
      </div>
    </Container>
  );
}
