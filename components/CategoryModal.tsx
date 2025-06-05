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

type CategoryItem = {
  id: string;
  name: string;
  skill_type?: 'knowledge' | 'skill/competence';
  is_digital_skill?: boolean;
  children?: CategoryItem[];
};

type CourseItem = {
  id: string;
  courseName: string;
  institutionName: string;
};

type CategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
};

export function CategoryModal({ isOpen, onClose, categories }: CategoryModalProps) {
  const [selectedLevel1, setSelectedLevel1] = useState<CategoryItem | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<CategoryItem | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const handleLevel1Select = useCallback((category: CategoryItem) => {
    setSelectedLevel1(category);
    setSelectedSkill(null);
    setCourses([]);
  }, []);

  const handleSkillSelect = useCallback((skill: CategoryItem) => {
    setSelectedSkill(skill);
  }, []);

  // Fetch courses when a skill is selected
  useEffect(() => {
    if (!selectedSkill) {
      setCourses([]);
      return;
    }

    const fetchCourses = async () => {
      setIsLoadingCourses(true);
      try {
        const response = await fetch(`/api/skills/${selectedSkill.id}/courses`);
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error('Failed to fetch courses');
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [selectedSkill]);

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
              <DialogPanel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="mb-4 flex items-start justify-between">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Explore Categories
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

                <div className="mt-4 grid h-[70vh] grid-cols-3 gap-4 overflow-hidden">
                  {/* First column: Categories */}
                  <div className="overflow-y-auto border-r border-gray-200 pr-4">
                    {categories.length > 0 ? (
                      <ul className="space-y-2">
                        {categories.map((category) => (
                          <li
                            key={category.id}
                            className={`cursor-pointer rounded-lg p-2 transition-colors ${
                              selectedLevel1?.id === category.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'hover:bg-gray-100'
                            }`}
                            onMouseEnter={() => handleLevel1Select(category)}
                          >
                            {category.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        No categories available
                      </div>
                    )}
                  </div>

                  {/* Second column: Skills */}
                  <div className="overflow-y-auto border-r border-gray-200 pr-4">
                    <AnimatePresence mode="wait">
                      {selectedLevel1 &&
                      selectedLevel1.children &&
                      selectedLevel1.children.length > 0 ? (
                        <motion.ul
                          key={selectedLevel1.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-2"
                        >
                          <h4 className="mb-3 text-sm font-medium text-gray-500">
                            Skills in "
                            {selectedLevel1.name.charAt(0).toUpperCase() +
                              selectedLevel1.name.slice(1)}
                            "
                          </h4>
                          {/* Filter out any children that have the same name as the first column categories */}
                          {selectedLevel1.children
                            .filter(
                              (skill) =>
                                !categories.some(
                                  (category) =>
                                    category.id === skill.id || category.name === skill.name
                                )
                            )
                            .sort((a, b) => {
                              // Sort by digital skills first, then alphabetically
                              if (Boolean(a.is_digital_skill) && !Boolean(b.is_digital_skill))
                                return -1;
                              if (!Boolean(a.is_digital_skill) && Boolean(b.is_digital_skill))
                                return 1;
                              return a.name.localeCompare(b.name);
                            })
                            .map((skill) => (
                              <li
                                key={skill.id}
                                className={`cursor-pointer rounded-lg p-2 transition-colors ${
                                  selectedSkill?.id === skill.id
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'hover:bg-gray-100'
                                }`}
                                onMouseEnter={() => handleSkillSelect(skill)}
                              >
                                {skill.name.charAt(0).toUpperCase() + skill.name.slice(1)}
                                {Boolean(skill.is_digital_skill) && (
                                  <span className="ml-2 rounded-full bg-emerald-600 px-2 py-0.5 text-xs text-white">
                                    Digital
                                  </span>
                                )}
                                {skill.skill_type === 'knowledge' && (
                                  <span className="ml-2 rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700">
                                    Knowledge
                                  </span>
                                )}
                                {skill.skill_type === 'skill/competence' && (
                                  <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs text-green-700">
                                    Skill
                                  </span>
                                )}
                              </li>
                            ))}
                        </motion.ul>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          {selectedLevel1
                            ? 'No skills available'
                            : 'Hover over a category to see skills'}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Third column: Courses for selected skill */}
                  <div className="overflow-y-auto">
                    <AnimatePresence mode="wait">
                      {selectedSkill ? (
                        <motion.div
                          key={selectedSkill.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <h4 className="mb-3 text-sm font-medium text-gray-500">
                            Courses teaching "{selectedSkill.name}"
                          </h4>

                          {isLoadingCourses ? (
                            <div className="flex items-center justify-center py-10">
                              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
                            </div>
                          ) : courses.length > 0 ? (
                            <motion.ul className="space-y-3">
                              {courses.map((course) => (
                                <li
                                  key={course.id}
                                  className="rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                                >
                                  <a href={`/courses/${course.id}`} className="block">
                                    <h5 className="font-medium text-gray-900">
                                      {course.courseName}
                                    </h5>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {course.institutionName}
                                    </p>
                                  </a>
                                </li>
                              ))}
                            </motion.ul>
                          ) : (
                            <div className="flex h-48 items-center justify-center text-gray-500">
                              No courses found for this skill
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-500">
                          Hover over a skill to see courses
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
