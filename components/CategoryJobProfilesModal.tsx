'use client';

import { useCallback, useState, useEffect } from 'react';
import {
  Dialog,
  DialogPanel,
  DialogBackdrop,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

type CategoryItem = {
  id: string;
  name: string;
  job_count?: number;
};

type JobProfileItem = {
  id: string;
  title: string;
  description: string;
  hierarchy_level: number;
};

type CategoryJobProfilesModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CategoryJobProfilesModal({ isOpen, onClose }: CategoryJobProfilesModalProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [jobProfiles, setJobProfiles] = useState<JobProfileItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const response = await fetch('/api/job-categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
          // Auto-select first category if available
          if (data.length > 0) {
            setSelectedCategory(data[0]);
          }
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [isOpen]);

  // Fetch job profiles when a category is selected
  useEffect(() => {
    if (!selectedCategory) {
      setJobProfiles([]);
      return;
    }

    const fetchJobProfiles = async () => {
      setIsLoadingProfiles(true);
      try {
        const response = await fetch(`/api/categories/${encodeURIComponent(selectedCategory.id)}/job-profiles`);
        if (response.ok) {
          const data = await response.json();
          setJobProfiles(data);
        } else {
          console.error('Failed to fetch job profiles');
          setJobProfiles([]);
        }
      } catch (error) {
        console.error('Error fetching job profiles:', error);
        setJobProfiles([]);
      } finally {
        setIsLoadingProfiles(false);
      }
    };

    fetchJobProfiles();
  }, [selectedCategory]);

  const handleCategorySelect = useCallback((category: CategoryItem) => {
    setSelectedCategory(category);
  }, []);


  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Explore Job Profiles by Category
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 grid h-[70vh] grid-cols-2 gap-6 overflow-hidden">
                  {/* First column: Categories */}
                  <div className="overflow-y-auto border-r border-gray-200 pr-6">
                    <h4 className="mb-3 text-sm font-medium text-gray-500">Job Categories</h4>
                    {isLoadingCategories ? (
                      <div className="flex h-full items-center justify-center">
                        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                      </div>
                    ) : categories.length > 0 ? (
                      <ul className="space-y-2">
                        {categories.map((category) => (
                          <li
                            key={category.id}
                            className={`cursor-pointer rounded-lg p-3 transition-all ${
                              selectedCategory?.id === category.id
                                ? 'bg-blue-100 text-blue-800 shadow-sm'
                                : 'hover:bg-gray-50'
                            }`}
                            onMouseEnter={() => handleCategorySelect(category)}
                            onClick={() => handleCategorySelect(category)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{category.name}</span>
                              {category.job_count && (
                                <span className={`text-sm ${
                                  selectedCategory?.id === category.id
                                    ? 'text-blue-600'
                                    : 'text-gray-500'
                                }`}>
                                  {category.job_count} {category.job_count === 1 ? 'job' : 'jobs'}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No categories available
                      </div>
                    )}
                  </div>

                  {/* Second column: Job Profiles */}
                  <div className="overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {selectedCategory ? (
                        <motion.div
                          key={selectedCategory.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <h4 className="mb-3 text-sm font-medium text-gray-500">
                            Job Profiles in "{selectedCategory.name}"
                          </h4>

                          {isLoadingProfiles ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            </div>
                          ) : jobProfiles.length > 0 ? (
                            <motion.ul className="space-y-3">
                              {jobProfiles.map((profile) => (
                                <li
                                  key={profile.id}
                                  className="rounded-lg border border-gray-200 p-4 transition-all hover:border-blue-300 hover:bg-blue-50"
                                >
                                  <Link href={`/job-profiles/${profile.id}`} onClick={onClose}>
                                    <div>
                                      <h5 className="font-medium text-gray-900 hover:text-blue-600">
                                        {profile.title}
                                      </h5>
                                      {profile.description && (
                                        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                          {profile.description}
                                        </p>
                                      )}
                                    </div>
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          ) : (
                            <div className="flex h-48 items-center justify-center text-gray-500">
                              No job profiles found in this category
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          Select a category to see job profiles
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}