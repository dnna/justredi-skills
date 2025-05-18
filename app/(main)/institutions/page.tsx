import Link from 'next/link';
import { getAllInstitutions } from '@/lib/db';
import { Container } from '@/components/Container';

export default async function InstitutionsPage() {
  const institutions = await getAllInstitutions(100, 0);

  return (
    <Container className="mt-16 mb-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
        Course Providers
      </h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Discover educational institutions offering courses that can help you develop your skills and
        advance your career.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {institutions.length > 0 ? (
          institutions.map((institution: any) => (
            <div
              key={institution.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                  {institution.name.substring(0, 2).toUpperCase()}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link
                      href={`/institutions/${institution.id}`}
                      className="hover:text-indigo-600"
                    >
                      {institution.name}
                    </Link>
                  </h3>

                  {institution.courseCount && (
                    <p className="mt-1 text-sm text-gray-500">
                      {institution.courseCount} courses available
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <Link
                  href={`/institutions/${institution.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View courses →
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-gray-500">
            No institutions found.
          </div>
        )}
      </div>
    </Container>
  );
}
