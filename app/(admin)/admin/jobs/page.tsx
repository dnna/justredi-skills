'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type JobProfile = {
  id: string;
  title: string;
  description: string;
  alt_titles: string;
  isco_group: string;
  hierarchy_level: number;
  is_broader_job: boolean;
  skills?: any[];
};

export default function JobsAdmin() {
  const [jobProfiles, setJobProfiles] = useState<JobProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchJobProfiles();
  }, []);

  const fetchJobProfiles = async (reset = false) => {
    try {
      const page = reset ? 0 : currentPage;
      const response = await fetch(`/api/job-profiles?limit=20&offset=${page * 20}`);
      if (response.ok) {
        const data = await response.json();
        if (reset) {
          setJobProfiles(data);
          setCurrentPage(0);
        } else {
          setJobProfiles((prev) => [...prev, ...data]);
        }
        setHasMore(data.length === 20);
        if (!reset) setCurrentPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching job profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredJobProfiles = jobProfiles.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.alt_titles && job.alt_titles.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchJobProfiles();
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Διαχείριση Εργασιακών Προφίλ</h1>
        <p className="mt-1 text-sm text-gray-600">
          Διαχειριστείτε τις απαιτούμενες δεξιότητες για κάθε εργασιακό προφίλ
        </p>
      </div>

      <div className="mb-6">
        <div className="max-w-md">
          <label htmlFor="search" className="sr-only">
            Αναζήτηση εργασιακών προφίλ
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
              placeholder="Αναζήτηση εργασιακών προφίλ..."
            />
          </div>
        </div>
      </div>

      {isLoading && jobProfiles.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-hidden bg-white shadow sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredJobProfiles.map((job) => (
              <li key={job.id}>
                <Link href={`/admin/jobs/${job.id}`}>
                  <div className="cursor-pointer px-4 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-indigo-600">{job.title}</p>
                        <p className="line-clamp-2 text-sm text-gray-500">{job.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          {job.isco_group && (
                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                              ISCO: {job.isco_group}
                            </span>
                          )}
                          {job.is_broader_job && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                              Ευρεία Κατηγορία
                            </span>
                          )}
                          <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Επίπεδο {job.hierarchy_level}
                          </span>
                        </div>
                        {job.alt_titles && (
                          <p className="mt-1 text-xs text-gray-400">
                            Εναλλακτικοί τίτλοι: {job.alt_titles}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-gray-400"
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
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {hasMore && !isLoading && (
            <div className="border-t border-gray-200 px-4 py-4">
              <button
                onClick={loadMore}
                className="w-full text-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Φόρτωση περισσότερων εργασιακών προφίλ
              </button>
            </div>
          )}

          {isLoading && jobProfiles.length > 0 && (
            <div className="border-t border-gray-200 px-4 py-4 text-center">
              <div className="inline-block h-4 w-4 animate-spin rounded-full border-b-2 border-indigo-600"></div>
            </div>
          )}
        </div>
      )}

      {!isLoading && filteredJobProfiles.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            {searchTerm
              ? 'Δεν βρέθηκαν εργασιακά προφίλ που να ταιριάζουν με την αναζήτησή σας.'
              : 'Δεν βρέθηκαν εργασιακά προφίλ.'}
          </p>
        </div>
      )}
    </div>
  );
}
