'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

type Course = {
  id: string;
  name: string;
  external_url: string;
  institution_name: string;
  institution_id: string;
  sequence_order: number;
  is_prerequisite: boolean;
};

type Skill = {
  id: number;
  esco_id: string;
  preferred_label: string;
  description: string;
  skill_type: string;
  is_digital_skill: boolean;
  is_green_skill: boolean;
  coverage_score: number;
  is_essential: boolean;
  skill_level: string;
};

type LearningPath = {
  id: number;
  name: string;
  description: string;
  essential_skills_match_percent: number;
  total_skills_match_percent: number;
  score: number;
  view_count: number;
  job_id: number;
  job_title: string;
  job_description: string;
  courses: Course[];
  skills: Skill[];
};

export default function LearningPathDetail() {
  const params = useParams();
  const learningPathId = params.id as string;

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLearningPath();
  }, [learningPathId]);

  const fetchLearningPath = async () => {
    try {
      const response = await fetch(`/api/learning-paths/${learningPathId}`);
      if (response.ok) {
        const data = await response.json();
        setLearningPath(data);
      } else if (response.status === 404) {
        setError('Το μαθησιακό μονοπάτι δεν βρέθηκε');
      } else {
        setError('Σφάλμα κατά τη φόρτωση του μαθησιακού μονοπατιού');
      }
    } catch (error) {
      console.error('Error fetching learning path:', error);
      setError('Σφάλμα κατά τη φόρτωση του μαθησιακού μονοπατιού');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Επιστροφή στην αρχική σελίδα
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const essentialSkills = learningPath.skills.filter((skill) => skill.is_essential);
  const additionalSkills = learningPath.skills.filter((skill) => !skill.is_essential);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="mb-4 flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">
                  Αρχική
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <Link
                    href={`/job-profiles/${learningPath.job_id}`}
                    className="ml-4 text-gray-500 hover:text-gray-700"
                  >
                    {learningPath.job_title}
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-4 text-sm font-medium text-gray-900">Μαθησιακό Μονοπάτι</span>
                </div>
              </li>
            </ol>
          </nav>

          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h1 className="mb-4 text-3xl font-bold text-gray-900">{learningPath.name}</h1>
            <p className="mb-6 text-gray-600">{learningPath.description}</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-500">
                      <span className="text-sm font-medium text-white">E</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Βασικές Δεξιότητες</p>
                    <p className="text-2xl font-bold text-red-600">
                      {learningPath.essential_skills_match_percent}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                      <span className="text-sm font-medium text-white">T</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Συνολικές Δεξιότητες</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {learningPath.total_skills_match_percent}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                      <span className="text-sm font-medium text-white">C</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">Μαθήματα</p>
                    <p className="text-2xl font-bold text-green-600">
                      {learningPath.courses.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Courses */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Μαθήματα ({learningPath.courses.length})
              </h2>

              {learningPath.courses.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500">
                    Δεν βρέθηκαν μαθήματα για αυτό το μαθησιακό μονοπάτι.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningPath.courses.map((course, index) => (
                    <div key={course.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center">
                            <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-800">
                              {index + 1}
                            </span>
                            <h3 className="text-lg font-medium text-gray-900">{course.name}</h3>
                            {course.is_prerequisite && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                Προαπαιτούμενο
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{course.institution_name}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {course.external_url ? (
                            <a
                              href={course.external_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Περισσότερα
                              <svg
                                className="ml-1 h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          ) : (
                            <Link
                              href={`/courses/${course.id}`}
                              className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                              Περισσότερα
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-6">
            {/* Essential Skills */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                Βασικές Δεξιότητες ({essentialSkills.length})
              </h3>

              {essentialSkills.length === 0 ? (
                <p className="text-sm text-gray-500">Δεν βρέθηκαν βασικές δεξιότητες.</p>
              ) : (
                <div className="space-y-3">
                  {essentialSkills.map((skill) => (
                    <div key={skill.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
                      <Link href={`/skills/${skill.id}`}>
                        <h4 className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                          {skill.preferred_label}
                        </h4>
                      </Link>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Βασική
                        </span>
                        {skill.is_digital_skill && (
                          <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            Ψηφιακή
                          </span>
                        )}
                        {skill.is_green_skill && (
                          <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Πράσινη
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Skills */}
            {additionalSkills.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow-lg">
                <h3 className="mb-4 text-lg font-bold text-gray-900">
                  Επιπλέον Δεξιότητες ({additionalSkills.length})
                </h3>

                <div className="space-y-3">
                  {additionalSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                    >
                      <Link href={`/skills/${skill.id}`}>
                        <h4 className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                          {skill.preferred_label}
                        </h4>
                      </Link>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          Επιπλέον
                        </span>
                        {skill.is_digital_skill && (
                          <span className="inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            Ψηφιακή
                          </span>
                        )}
                        {skill.is_green_skill && (
                          <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Πράσινη
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
