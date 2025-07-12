import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobProfile } from '@/lib/db';
import { Container } from '@/components/Container';
import { CollapsibleSkillSection } from '@/components/CollapsibleSkillSection';
import { LearningPathTracker } from '@/components/LearningPathTracker';

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

      {/* Learning Paths - Visual Journey */}
      <div className="mb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Προτεινόμενες Μαθησιακές διαδρομές</h2>
          <p className="mt-2 text-lg text-gray-600">
            Εξερευνήστε διαφορετικές επιλογές για να αποκτήσετε τις δεξιότητες που απαιτούνται για
            αυτόν τον επαγγελματικό ρόλο
          </p>
        </div>

        {jobProfile.learningPaths && jobProfile.learningPaths.length > 0 ? (
          <div className="space-y-12">
            {jobProfile.learningPaths.map((path: any, pathIndex: number) => (
              <div
                key={path.id}
                id={`learning-path-${path.id}`}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
              >
                <LearningPathTracker learningPathId={path.id} />
                {/* Path Header with Visual Progress */}
                <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Επιλογή {pathIndex + 1}</h3>
                      <p className="mt-1 text-gray-600">
                        Αυτή η μαθησιακή διαδρομή αποτελείται από{' '}
                        <span className="font-bold">{path.courses.length} μαθήματα</span> που
                        καλύπτουν:
                      </p>
                    </div>
                  </div>

                  {/* Visual Skill Coverage */}
                  <div className="mt-6 max-w-lg space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="w-48 text-sm font-bold text-indigo-600">
                        {path.covered_essential_skills || 0}/{path.total_essential_skills || 0}{' '}
                        Απαραίτητες Δεξιότητες
                      </span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500"
                          style={{ width: `${path.essential_skills_match_percent}%` }}
                        />
                      </div>
                    </div>
                    {optionalSkills.length > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="w-48 text-sm font-bold text-gray-600">
                          {path.covered_non_essential_skills || 0}/
                          {path.total_non_essential_skills || 0} Προαιρετικές Δεξιότητες
                        </span>
                        <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-gray-400 to-gray-500 transition-all duration-500"
                            style={{
                              width: `${
                                path.total_non_essential_skills > 0
                                  ? Math.round(
                                      (path.covered_non_essential_skills /
                                        path.total_non_essential_skills) *
                                        100
                                    )
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Learning Journey - Horizontal Layout */}
                <div className="p-6">
                  <h4 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gray-700">
                    Μαθήματα
                  </h4>

                  {/* Course Sequence */}
                  <div className="space-y-6">
                    {/* Essential Skills Section */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasEssentialPhase = essentialCompleteIndex >= 0;
                      const essentialCourses = hasEssentialPhase
                        ? path.courses.slice(0, essentialCompleteIndex + 1)
                        : path.courses;

                      return (
                        essentialCourses.length > 0 && (
                          <div>
                            <div className="flex flex-wrap items-stretch gap-3">
                              {essentialCourses.map((course: any, courseIndex: number) => (
                                <div key={course.id} className="flex items-stretch">
                                  {/* Course Card */}
                                  <div
                                    className="flex h-full min-w-0 flex-shrink-0 flex-col rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-3 transition-colors hover:from-indigo-100 hover:to-purple-100"
                                    style={{ maxWidth: '280px' }}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
                                        <span className="text-xs font-bold text-white">
                                          {courseIndex + 1}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <Link
                                          href={`/courses/${course.id}`}
                                          className="block truncate text-sm font-medium text-gray-900 hover:text-indigo-600"
                                          title={course.name}
                                        >
                                          {course.name}
                                        </Link>
                                        <p className="truncate text-xs text-gray-500">
                                          {course.institution_name}
                                        </p>

                                        {/* Skills gained */}
                                        {course.skills && course.skills.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              {course.skills.map((skill: any) => (
                                                <span
                                                  key={skill.id}
                                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                                    skill.is_essential
                                                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
                                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                                                  }`}
                                                >
                                                  {!!skill.is_digital_skill && (
                                                    <svg
                                                      className="mr-1 h-3 w-3"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                                                      />
                                                    </svg>
                                                  )}
                                                  {skill.preferred_label}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}

                    {/* Phase Transition Indicator - only show if there are courses after the essential phase */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasCoursesAfterEssential =
                        essentialCompleteIndex >= 0 &&
                        essentialCompleteIndex < path.courses.length - 1;
                      return (
                        hasCoursesAfterEssential && (
                          <div className="my-6">
                            <div className="flex items-center justify-center">
                              <div className="h-px flex-1 bg-gray-300"></div>
                              <div
                                className={`rounded-full border px-4 py-2 ${
                                  path.essential_skills_match_percent >= 100
                                    ? 'border-green-300 bg-green-100'
                                    : 'border-yellow-300 bg-yellow-100'
                                }`}
                              >
                                <div
                                  className={`flex items-center text-sm font-medium ${
                                    path.essential_skills_match_percent >= 100
                                      ? 'text-green-800'
                                      : 'text-yellow-800'
                                  }`}
                                >
                                  {path.essential_skills_match_percent >= 100
                                    ? 'Όλες οι Απαραίτητες Δεξιότητες Καλύφθηκαν'
                                    : 'Προαιρετικές Δεξιότητες'}
                                </div>
                              </div>
                              <div className="h-px flex-1 bg-gray-300"></div>
                            </div>
                          </div>
                        )
                      );
                    })()}

                    {/* Additional Skills Section */}
                    {(() => {
                      const essentialCompleteIndex = path.courses.findIndex(
                        (c: any) => c.isLastEssentialCourse
                      );
                      const hasAdditionalPhase =
                        essentialCompleteIndex >= 0 &&
                        essentialCompleteIndex < path.courses.length - 1;
                      const additionalCourses = hasAdditionalPhase
                        ? path.courses.slice(essentialCompleteIndex + 1)
                        : [];

                      return (
                        additionalCourses.length > 0 && (
                          <div>
                            <div className="flex flex-wrap items-stretch gap-3">
                              {additionalCourses.map((course: any, courseIndex: number) => (
                                <div key={course.id} className="flex items-stretch">
                                  {/* Course Card */}
                                  <div
                                    className="flex h-full min-w-0 flex-shrink-0 flex-col rounded-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 transition-colors hover:from-gray-100 hover:to-gray-200"
                                    style={{ maxWidth: '280px' }}
                                  >
                                    <div className="flex items-start">
                                      <div className="mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-gray-500 to-gray-600">
                                        <span className="text-xs font-bold text-white">
                                          {essentialCompleteIndex + 2 + courseIndex}
                                        </span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <Link
                                          href={`/courses/${course.id}`}
                                          className="block truncate text-sm font-medium text-gray-900 hover:text-gray-600"
                                          title={course.name}
                                        >
                                          {course.name}
                                        </Link>
                                        <p className="truncate text-xs text-gray-500">
                                          {course.institution_name}
                                        </p>

                                        {/* Skills gained */}
                                        {course.skills && course.skills.length > 0 && (
                                          <div className="mt-2">
                                            <div className="flex flex-wrap gap-1">
                                              {course.skills.slice(0, 3).map((skill: any) => (
                                                <span
                                                  key={skill.id}
                                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
                                                    skill.is_essential
                                                      ? 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700'
                                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700'
                                                  }`}
                                                >
                                                  {skill.preferred_label}
                                                </span>
                                              ))}
                                              {course.skills.length > 3 && (
                                                <span className="text-xs text-gray-500">
                                                  +{course.skills.length - 3}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      );
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
