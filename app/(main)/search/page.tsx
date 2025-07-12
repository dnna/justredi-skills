import { searchAll } from '@/lib/db';
import { Container } from '@/components/Container';
import Link from 'next/link';
import {
  MagnifyingGlassIcon,
  BookOpenIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  ChevronRightIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { SearchResultCard } from '@/components/SearchResultCard';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const searchTerm = params.q || '';
  const results = (await searchAll(searchTerm)) as any[];

  const categorizedResults = {
    courses: results.filter((r: any) => r.type === 'course'),
    skills: results.filter((r: any) => r.type === 'skill'),
    job_profiles: results.filter((r: any) => r.type === 'job_profile'),
    institutions: results.filter((r: any) => r.type === 'institution'),
  };

  const totalResults = results.length;
  const categoryIcons = {
    courses: BookOpenIcon,
    skills: SparklesIcon,
    job_profiles: BriefcaseIcon,
    institutions: BuildingOfficeIcon,
  };

  const categoryTitles = {
    courses: 'Μαθήματα',
    skills: 'Δεξιότητες & Ικανότητες',
    job_profiles: 'Εργασιακά Προφίλ',
    institutions: 'Εκπαιδευτικά Ιδρύματα',
  };

  const categoryDescriptions = {
    courses: 'Εκπαιδευτικά προγράμματα και ευκαιρίες κατάρτισης',
    skills: 'Ικανότητες και δεξιότητες που μπορείτε να αναπτύξετε',
    job_profiles: 'Εργασιακές διαδρομές και περιγραφές εργασιακών προφίλ',
    institutions: 'Σχολεία, πανεπιστήμια και κέντρα κατάρτισης',
  };

  return (
    <Container className="mb-24 mt-8">
      {/* Search Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-50 via-white to-emerald-50 px-8 py-12 shadow-sm">
        <div className="relative z-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-600 text-white">
              <MagnifyingGlassIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Αποτελέσματα Αναζήτησης
              </h1>
              <p className="mt-1 text-lg text-gray-600">
                {totalResults > 0 ? (
                  <>
                    {totalResults === 1 ? 'Βρέθηκε' : 'Βρέθηκαν'} <span className="font-semibold text-green-600">{totalResults}</span>{' '}
                    {totalResults === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'} για <span className="font-semibold">"{searchTerm}"</span>
                  </>
                ) : (
                  <>
                    Δεν βρέθηκαν αποτελέσματα για <span className="font-semibold">"{searchTerm}"</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 opacity-50 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 opacity-50 blur-3xl" />
      </div>

      {/* Results Content */}
      <div className="mt-10">
        {results.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <MagnifyingGlassIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mt-6 text-lg font-semibold text-gray-900">Δεν βρέθηκαν αποτελέσματα</h3>
            <p className="mt-2 text-sm text-gray-600">
              Δοκιμάστε να προσαρμόσετε τους όρους αναζήτησης ή περιηγηθείτε στις κατηγορίες μας
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                Επιστροφή στην Αρχική
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(categorizedResults).map(([category, items]) => {
              if (items.length === 0) return null;

              const Icon = categoryIcons[category as keyof typeof categoryIcons];
              const title = categoryTitles[category as keyof typeof categoryTitles];
              const description =
                categoryDescriptions[category as keyof typeof categoryDescriptions];

              return (
                <div key={category} className="group">
                  {/* Category Header */}
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
                      <Icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                      <p className="mt-1 text-gray-600">
                        {items.length} {items.length === 1 ? 'αποτέλεσμα' : 'αποτελέσματα'} • {description}
                      </p>
                    </div>
                  </div>

                  {/* Results Grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.slice(0, 9).map((item: any, index: number) => (
                      <SearchResultCard
                        key={item.id}
                        item={item}
                        category={category}
                        index={index}
                        iconName={category}
                      />
                    ))}
                  </div>

                  {/* Show More */}
                  {items.length > 9 && (
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-600">Εμφάνιση 9 από {items.length} αποτελέσματα</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Tips */}
      {results.length > 0 && (
        <div className="mt-16 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white">
              <FunnelIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Βελτιώστε την αναζήτησή σας</h3>
              <p className="mt-2 text-sm text-gray-600">
                Δοκιμάστε να χρησιμοποιήσετε πιο συγκεκριμένες λέξεις-κλειδιά ή περιηγηθείτε στις
                κατηγορίες μας για να βρείτε ακριβώς αυτό που ψάχνετε.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/courses"
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
                >
                  <BookOpenIcon className="mr-1.5 h-4 w-4" />
                  Περιήγηση Μαθημάτων
                </Link>
                <Link
                  href="/skills"
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
                >
                  <SparklesIcon className="mr-1.5 h-4 w-4" />
                  Εξερεύνηση Δεξιοτήτων
                </Link>
                <Link
                  href="/job-profiles"
                  className="inline-flex items-center rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-gray-50"
                >
                  <BriefcaseIcon className="mr-1.5 h-4 w-4" />
                  Προβολή Εργασιακών Προφίλ
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
