import Link from 'next/link';
import { getAllInstitutions, getInstitutionsBySource } from '@/lib/db';
import { Container } from '@/components/Container';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ source?: string }>;
}

export default async function InstitutionsPage({ searchParams }: PageProps) {
  const { source } = await searchParams;

  const institutionsResult = source
    ? await getInstitutionsBySource(source, 100, 0)
    : await getAllInstitutions(100, 0);
  const institutions = Array.isArray(institutionsResult) ? institutionsResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Πάροχοι εκπαιδευτικών προγραμμάτων
      </h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Ανακαλύψτε εκπαιδευτικά ιδρύματα που προσφέρουν εκπαιδευτικά προγράμματα που μπορούν να σας
        βοηθήσουν να αναπτύξετε τις δεξιότητές σας και να προωθήσετε την καριέρα σας.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {institutions.length > 0 ? (
          institutions.map((institution: any) => (
            <div
              key={institution.id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                {institution.logo_url ? (
                  <img
                    src={institution.logo_url}
                    alt={`${institution.name} logo`}
                    className="h-12 w-12 flex-shrink-0 rounded-full border border-gray-200 bg-white object-contain p-1"
                  />
                ) : (
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 font-bold text-gray-500">
                    {institution.name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link
                      href={`/institutions/${institution.id}`}
                      className="hover:text-indigo-600"
                    >
                      {institution.name}
                    </Link>
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {institution.courseCount || 0}{' '}
                    {institution.courseCount === 1
                      ? 'διαθέσιμο εκπαιδευτικό πρόγραμμα'
                      : 'διαθέσιμα εκπαιδευτικά προγράμματα'}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/institutions/${institution.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Δείτε τα εκπαιδευτικά προγράμματα →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500">Δεν βρέθηκαν πάροχοι.</div>
        )}
      </div>
    </Container>
  );
}
