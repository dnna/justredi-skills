'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type CourseSkill = {
  skill_id: number;
  esco_id: string;
  skill_name: string;
  retrieval_score: number;
  rerank_score: number;
  skill_type: string;
  is_digital_skill: boolean;
};

type Skill = {
  id: number;
  skill_name: string;
  skill_type: string;
  is_digital_skill: boolean;
};

type Course = {
  id: string;
  courseName: string;
  institutionName: string;
  institution_id: string;
  language: string;
  provider: string;
  external_url: string;
};

export default function CourseSkillManagement() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [skills, setSkills] = useState<CourseSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<CourseSkill | null>(null);
  const [newScores, setNewScores] = useState({ retrieval_score: 0.5, rerank_score: 0.5 });

  useEffect(() => {
    fetchCourseData();
    fetchSkillAssignments();
  }, [courseId]);

  useEffect(() => {
    if (showAddModal && searchTerm) {
      searchAvailableSkills();
    }
  }, [searchTerm, showAddModal]);

  const fetchCourseData = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const courseData = await response.json();
        setCourse(courseData);
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchSkillAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/course-skills?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setSkills(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching skill assignments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchAvailableSkills = async () => {
    try {
      const response = await fetch(
        `/api/admin/skills/search?courseId=${courseId}&q=${encodeURIComponent(searchTerm)}&limit=10`
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableSkills(data.skills);
      }
    } catch (error) {
      console.error('Error searching skills:', error);
    }
  };

  const handleAddSkill = async (skillId: number) => {
    try {
      const response = await fetch('/api/admin/course-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: Number(courseId),
          skillId,
          retrieval_score: newScores.retrieval_score,
          rerank_score: newScores.rerank_score,
        }),
      });

      if (response.ok) {
        fetchSkillAssignments();
        setShowAddModal(false);
        setSearchTerm('');
        setAvailableSkills([]);
        setNewScores({ retrieval_score: 0.5, rerank_score: 0.5 });
      } else {
        alert('Σφάλμα κατά την ανάθεση της δεξιότητας');
      }
    } catch (error) {
      console.error('Error adding skill:', error);
      alert('Σφάλμα κατά την ανάθεση της δεξιότητας');
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    try {
      const response = await fetch('/api/admin/course-skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: Number(courseId),
          skillId: editingSkill.skill_id,
          retrieval_score: newScores.retrieval_score,
          rerank_score: newScores.rerank_score,
        }),
      });

      if (response.ok) {
        fetchSkillAssignments();
        setEditingSkill(null);
        setNewScores({ retrieval_score: 0.5, rerank_score: 0.5 });
      } else {
        alert('Σφάλμα κατά την ενημέρωση της δεξιότητας');
      }
    } catch (error) {
      console.error('Error updating skill:', error);
      alert('Σφάλμα κατά την ενημέρωση της δεξιότητας');
    }
  };

  const handleRemoveSkill = async (skillId: number) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να αφαιρέσετε αυτή τη δεξιότητα;')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/course-skills?courseId=${courseId}&skillId=${skillId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        fetchSkillAssignments();
      } else {
        alert('Σφάλμα κατά την αφαίρεση της δεξιότητας');
      }
    } catch (error) {
      console.error('Error removing skill:', error);
      alert('Σφάλμα κατά την αφαίρεση της δεξιότητας');
    }
  };

  const startEdit = (skill: CourseSkill) => {
    setEditingSkill(skill);
    setNewScores({
      retrieval_score: skill.retrieval_score,
      rerank_score: skill.rerank_score,
    });
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
      <div className="mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <Link href="/admin/courses" className="text-gray-500 hover:text-gray-700">
                Μαθήματα
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
                <span className="ml-4 text-sm font-medium text-gray-900">{course?.courseName}</span>
              </div>
            </li>
          </ol>
        </nav>

        {course && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
            <p className="mt-1 text-sm text-gray-600">
              {course.institutionName} • {course.language}
            </p>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Αντιστοιχισμένες Δεξιότητες ({skills.length})
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Προσθήκη Δεξιότητας
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-500">
                Δεν έχουν ανατεθεί δεξιότητες σε αυτό το μάθημα.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="min-w-0 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Δεξιότητα
                    </th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Retrieval
                    </th>
                    <th className="w-24 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Rerank
                    </th>
                    <th className="w-20 px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Τύπος
                    </th>
                    <th className="w-32 px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Ενέργειες
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {skills.map((skill) => (
                    <tr key={skill.skill_id}>
                      <td className="px-3 py-4">
                        <div className="flex min-w-0 items-center">
                          <div className="min-w-0 flex-1">
                            <div
                              className="truncate text-sm font-medium text-gray-900"
                              title={skill.skill_name}
                            >
                              {skill.skill_name}
                            </div>
                            <div className="truncate text-xs text-gray-500" title={skill.esco_id}>
                              {skill.esco_id}
                            </div>
                            {skill.is_digital_skill && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                                Ψηφιακή
                              </span>
                            )}
                            {skill.is_green_skill && (
                              <span className="mt-1 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                                Πράσινη
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {skill.retrieval_score?.toFixed(3) || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                        {skill.rerank_score?.toFixed(3) || 'N/A'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                          {skill.skill_type}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEdit(skill)}
                            className="rounded px-2 py-1 text-xs text-indigo-600 hover:text-indigo-900"
                          >
                            Επεξεργασία
                          </button>
                          <button
                            onClick={() => handleRemoveSkill(skill.skill_id)}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:text-red-900"
                          >
                            Αφαίρεση
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Skill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Προσθήκη Δεξιότητας</h3>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Αναζήτηση Δεξιότητας
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  placeholder="Πληκτρολογήστε για αναζήτηση..."
                />
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Retrieval Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={newScores.retrieval_score}
                    onChange={(e) =>
                      setNewScores((prev) => ({ ...prev, retrieval_score: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rerank Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={newScores.rerank_score}
                    onChange={(e) =>
                      setNewScores((prev) => ({ ...prev, rerank_score: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
              </div>

              {availableSkills.length > 0 && (
                <div className="mb-4 max-h-40 overflow-y-auto rounded-md border border-gray-200">
                  {availableSkills.map((skill) => (
                    <div
                      key={skill.id}
                      onClick={() => handleAddSkill(skill.id)}
                      className="cursor-pointer border-b border-gray-100 p-3 last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="text-sm font-medium text-gray-900">{skill.skill_name}</div>
                      <div className="mt-1 flex items-center">
                        <span className="text-xs text-gray-500">{skill.skill_type}</span>
                        {skill.is_digital_skill && (
                          <span className="ml-2 inline-flex items-center rounded bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                            Ψηφιακή
                          </span>
                        )}
                        {skill.is_green_skill && (
                          <span className="ml-2 inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            Πράσινη
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setSearchTerm('');
                    setAvailableSkills([]);
                    setNewScores({ retrieval_score: 0.5, rerank_score: 0.5 });
                  }}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Ακύρωση
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 h-full w-full overflow-y-auto bg-gray-600 bg-opacity-50">
          <div className="relative top-20 mx-auto w-96 rounded-md border bg-white p-5 shadow-lg">
            <div className="mt-3">
              <h3 className="mb-4 text-lg font-medium text-gray-900">Επεξεργασία Δεξιότητας</h3>

              <div className="mb-4">
                <p className="text-sm text-gray-600">{editingSkill.skill_name}</p>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Retrieval Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={newScores.retrieval_score}
                    onChange={(e) =>
                      setNewScores((prev) => ({ ...prev, retrieval_score: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Rerank Score
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.001"
                    value={newScores.rerank_score}
                    onChange={(e) =>
                      setNewScores((prev) => ({ ...prev, rerank_score: Number(e.target.value) }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setNewScores({ retrieval_score: 0.5, rerank_score: 0.5 });
                  }}
                  className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={handleUpdateSkill}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  Ενημέρωση
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
