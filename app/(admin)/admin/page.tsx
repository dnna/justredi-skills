'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type AdminStats = {
  total_course_skills: number;
  total_job_skills: number;
  total_learning_paths: number;
  courses_without_skills: number;
  skills_without_courses: number;
  jobs_without_skills: number;
  skills_without_jobs: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const credentials = localStorage.getItem('admin_credentials');
      const response = await fetch('/api/admin/stats', {
        headers: credentials ? { Authorization: `Basic ${credentials}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateAllPaths = async () => {
    if (!confirm('Αυτό θα αναδημιουργήσει όλα τα μαθησιακά μονοπάτια. Είστε σίγουροι;')) {
      return;
    }

    setIsRegenerating(true);
    try {
      const credentials = localStorage.getItem('admin_credentials');
      const response = await fetch('/api/admin/learning-paths/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(credentials && { Authorization: `Basic ${credentials}` }),
        },
        body: JSON.stringify({ regenerate: true }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        fetchStats();
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

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="rounded-lg border-4 border-dashed border-gray-200 p-6">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Διαχείριση Συστήματος</h1>

        {stats && (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500">
                      <span className="text-sm font-medium text-white">CS</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Αναθέσεις Μαθήματα-Δεξιότητες
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_course_skills.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-500">
                      <span className="text-sm font-medium text-white">JS</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="truncate text-sm font-medium text-gray-500">
                        Αναθέσεις Εργασία-Δεξιότητες
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_job_skills.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

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
                        Μαθησιακά Μονοπάτια
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_learning_paths.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Ενέργειες Συστήματος</h3>
            <div className="space-y-4">
              <button
                onClick={handleRegenerateAllPaths}
                disabled={isRegenerating}
                className="w-full rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {isRegenerating
                  ? 'Αναδημιουργία...'
                  : 'Αναδημιουργία Όλων των Μαθησιακών Μονοπατιών'}
              </button>
              <p className="text-sm text-gray-500">
                Αυτό θα διαγράψει και θα αναδημιουργήσει όλα τα μαθησιακά μονοπάτια βάσει των
                τρεχουσών αναθέσεων δεξιοτήτων.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link href="/admin/courses">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Διαχείριση Μαθημάτων</h3>
              <p className="text-sm text-gray-600">
                Αναθέστε ή αφαιρέστε δεξιότητες από μαθήματα και ρυθμίστε τα scores τους.
              </p>
            </div>
          </Link>

          <Link href="/admin/jobs">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                Διαχείριση Εργασιακών Προφίλ
              </h3>
              <p className="text-sm text-gray-600">
                Καθορίστε τις απαιτούμενες δεξιότητες για κάθε εργασιακό προφίλ.
              </p>
            </div>
          </Link>

          <Link href="/admin/learning-paths">
            <div className="cursor-pointer rounded-lg bg-white p-6 shadow transition-shadow hover:shadow-md">
              <h3 className="mb-2 text-lg font-medium text-gray-900">Μαθησιακά Μονοπάτια</h3>
              <p className="text-sm text-gray-600">
                Παρακολουθήστε και αναδημιουργήστε μαθησιακά μονοπάτια.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
