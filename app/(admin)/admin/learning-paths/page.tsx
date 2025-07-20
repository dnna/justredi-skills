'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type LearningPath = {
  id: number;
  name: string;
  description: string;
  job_title: string;
  job_id: number;
  essential_skills_match_percent: number;
  total_skills_match_percent: number;
  course_count: number;
  view_count: number;
};

export default function LearningPathsAdmin() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      // Using the existing featured learning paths endpoint for now
      const response = await fetch('/api/learning-paths/featured');
      if (response.ok) {
        const data = await response.json();
        setLearningPaths(data);
      }
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!confirm('Αυτό θα αναδημιουργήσει όλα τα μαθησιακά μονοπάτια. Είστε σίγουροι;')) {
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/admin/learning-paths/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: true }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchLearningPaths();
      } else {
        alert('Σφάλμα κατά την αναδημιουργία των μαθησιακών μονοπατιών');
      }
    } catch (error) {
      console.error('Error regenerating paths:', error);
      alert('Σφάλμα κατά την αναδημιουργία των μαθησιακών μονοπατιών');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Αυτό θα διαγράψει όλα τα μαθησιακά μονοπάτια. Είστε σίγουροι;')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/learning-paths/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ regenerate: false }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchLearningPaths();
      } else {
        alert('Σφάλμα κατά τη διαγραφή των μαθησιακών μονοπατιών');
      }
    } catch (error) {
      console.error('Error clearing paths:', error);
      alert('Σφάλμα κατά τη διαγραφή των μαθησιακών μονοπατιών');
    }
  };

  const filteredPaths = learningPaths.filter(
    (path) =>
      path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Μαθησιακών Μονοπατιών</h1>
        <p className="mt-1 text-sm text-gray-600">
          Παρακολουθήστε και διαχειριστείτε τα μαθησιακά μονοπάτια του συστήματος
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500">
                  <span className="text-sm font-medium text-white">LP</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">
                    Συνολικά Μαθησιακά Μονοπάτια
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">{learningPaths.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleRegenerateAll}
          disabled={isRegenerating}
          className="rounded-lg bg-indigo-600 px-6 py-4 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {isRegenerating ? 'Αναδημιουργία...' : 'Αναδημιουργία Όλων'}
        </button>

        <button
          onClick={handleClearAll}
          className="rounded-lg bg-red-600 px-6 py-4 font-medium text-white transition-colors hover:bg-red-700"
        >
          Διαγραφή Όλων
        </button>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="sr-only">
            Αναζήτηση μαθησιακών μονοπατιών
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Αναζήτηση μαθησιακών μονοπατιών..."
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          {filteredPaths.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">
                {searchTerm
                  ? 'Δεν βρέθηκαν μαθησιακά μονοπάτια που να ταιριάζουν με την αναζήτησή σας.'
                  : 'Δεν βρέθηκαν μαθησιακά μονοπάτια.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {filteredPaths.map((path) => (
                <li key={path.id}>
                  <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-indigo-600">{path.name}</p>
                        <p className="text-sm text-gray-500">Εργασιακό Προφίλ: {path.job_title}</p>
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            Βασικές: {path.essential_skills_match_percent}%
                          </span>
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Συνολικές: {path.total_skills_match_percent}%
                          </span>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {path.course_count} Μαθήματα
                          </span>
                          {path.view_count > 0 && (
                            <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                              {path.view_count} Προβολές
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 space-x-2">
                        <Link href={`/admin/jobs/${path.job_id}`}>
                          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">
                            Επεξεργασία Εργασιακού Προφίλ
                          </button>
                        </Link>
                        <Link href={`/learning-paths/${path.id}`}>
                          <button className="text-sm font-medium text-green-600 hover:text-green-900">
                            Προβολή
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="mt-8 rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Σημαντικές Πληροφορίες</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Τα μαθησιακά μονοπάτια δημιουργούνται αυτόματα βάσει των αναθέσεων δεξιοτήτων
                </li>
                <li>Όταν αλλάζετε αναθέσεις δεξιοτήτων, χρειάζεται αναδημιουργία των μονοπατιών</li>
                <li>
                  Τα ποσοστά κάλυψης δείχνουν πόσο καλά καλύπτονται οι απαιτούμενες δεξιότητες
                </li>
                <li>
                  Η αναδημιουργία μπορεί να διαρκέσει αρκετά λεπτά για μεγάλα σύνολα δεδομένων
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
