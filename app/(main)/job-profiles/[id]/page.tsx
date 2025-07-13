import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobProfile } from '@/lib/db';
import { Container } from '@/components/Container';
import { CollapsibleSkillSection } from '@/components/CollapsibleSkillSection';
import { LearningPathVisualMap } from '@/components/LearningPathVisualMap';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface JobProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function JobProfilePage({ params }: JobProfilePageProps) {
  const { id } = await params;
  const jobProfile = await getJobProfile(id);

  if (!jobProfile) {
    notFound();
  }

  // Separate essential and optional skills
  const essentialSkills = jobProfile.skills?.filter((skill: any) => skill.is_essential) || [];
  const optionalSkills = jobProfile.skills?.filter((skill: any) => !skill.is_essential) || [];

  return (
    <Container className="mb-24 mt-16">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link href="/job-profiles" className="text-gray-500 hover:text-gray-700">
              Εργασιακά Προφίλ
            </Link>
          </li>
          <li>
            <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </li>
          <li className="font-medium text-gray-900">{jobProfile.title}</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {jobProfile.title}
        </h1>
        <p className="mt-4 text-lg leading-8 text-gray-600">{jobProfile.description}</p>
        {jobProfile.alt_titles && (
          <div className="mt-3 text-sm text-gray-500">
            <span className="font-medium">Γνωστό και ως:</span> {jobProfile.alt_titles}
          </div>
        )}
      </div>

      {/* Required Skills Section */}
      <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Απαιτούμενες δεξιότητες για αυτό το επαγγελματικό προφίλ
        </h2>

        {jobProfile.skills && jobProfile.skills.length > 0 ? (
          <div className="space-y-4">
            {essentialSkills.length > 0 && (
              <CollapsibleSkillSection
                title="Απαραίτητες Δεξιότητες"
                skills={essentialSkills}
                count={essentialSkills.length}
                isExpanded={false}
                skillColorClass="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 hover:from-indigo-200 hover:to-purple-200"
              />
            )}

            {optionalSkills.length > 0 && (
              <CollapsibleSkillSection
                title="Προαιρετικές Δεξιότητες"
                skills={optionalSkills}
                count={optionalSkills.length}
                isExpanded={false}
                skillColorClass="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300"
              />
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500">
            Δεν έχουν αντιστοιχιστεί συγκεκριμένες δεξιότητες σε αυτό το επαγγελματικό προφίλ ακόμη.
          </p>
        )}
      </div>

      {/* Learning Paths - Interactive Visual Map */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Προτεινόμενες Μαθησιακές διαδρομές</h2>
          <p className="mt-2 text-lg text-gray-600">
            Εξερευνήστε διαφορετικές επιλογές για να αποκτήσετε τις δεξιότητες που απαιτούνται για
            αυτόν τον επαγγελματικό ρόλο
          </p>
        </div>

        {jobProfile.learningPaths && jobProfile.learningPaths.length > 0 ? (
          <LearningPathVisualMap
            learningPaths={jobProfile.learningPaths}
            hasOptionalSkills={optionalSkills.length > 0}
            essentialSkills={essentialSkills}
            optionalSkills={optionalSkills}
          />
        ) : (
          <div className="rounded-xl bg-gray-50 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Δεν υπάρχουν ακόμη διαθέσιμες μαθησιακές διαδρομές
            </h3>
            <p className="mx-auto mt-2 max-w-md text-gray-500">
              Εργαζόμαστε για τη δημιουργία επιμελημένων μαθησιακών διαδρομών για αυτό το
              επαγγελματικό προφίλ. Ελέγξτε ξανά σύντομα!
            </p>
          </div>
        )}
      </div>
    </Container>
  );
}
