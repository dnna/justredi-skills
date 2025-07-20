'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type JobSkill = {
  skill_id: number;
  esco_id: string;
  skill_name: string;
  is_essential: boolean;
  skill_level: string;
  skill_type: string;
  is_digital_skill: boolean;
};

type Skill = {
  id: number;
  skill_name: string;
  skill_type: string;
  is_digital_skill: boolean;
};

type JobProfile = {
  id: string;
  title: string;
  description: string;
  alt_titles: string;
  isco_group: string;
  hierarchy_level: number;
  is_broader_job: boolean;
};

export default function JobSkillManagement() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [jobProfile, setJobProfile] = useState<JobProfile | null>(null);
  const [skills, setSkills] = useState<JobSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<JobSkill | null>(null);
  const [newProperties, setNewProperties] = useState({
    is_essential: true,
  });
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    fetchJobData();
    fetchSkillAssignments();
  }, [jobId]);

  useEffect(() => {
    if (showAddModal && searchTerm) {
      searchAvailableSkills();
    }
  }, [searchTerm, showAddModal]);

  const fetchJobData = async () => {
    try {
      const response = await fetch(`/api/job-profiles/${jobId}`);
      if (response.ok) {
        const jobData = await response.json();
        setJobProfile(jobData);
      }
    } catch (error) {
      console.error('Error fetching job profile:', error);
    }
  };

  const fetchSkillAssignments = async () => {
    try {
      const response = await fetch(`/api/admin/job-skills?jobId=${jobId}`);
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
        `/api/admin/skills/search?jobId=${jobId}&q=${encodeURIComponent(searchTerm)}&limit=10`
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
      const response = await fetch('/api/admin/job-skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: Number(jobId),
          skillId,
          is_essential: newProperties.is_essential,
          skill_level: 'intermediate',
        }),
      });

      if (response.ok) {
        fetchSkillAssignments();
        setShowAddModal(false);
        setSearchTerm('');
        setAvailableSkills([]);
        setNewProperties({ is_essential: true });
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
      const response = await fetch('/api/admin/job-skills', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: Number(jobId),
          skillId: editingSkill.skill_id,
          is_essential: newProperties.is_essential,
          skill_level: 'intermediate',
        }),
      });

      if (response.ok) {
        fetchSkillAssignments();
        setEditingSkill(null);
        setNewProperties({ is_essential: true });
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
      const response = await fetch(`/api/admin/job-skills?jobId=${jobId}&skillId=${skillId}`, {
        method: 'DELETE',
      });

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

  const handleRegenerateLearningPaths = async () => {
    if (
      !confirm(
        'Αυτό θα αναδημιουργήσει τα μαθησιακά μονοπάτια για αυτό το εργασιακό προφίλ. Είστε σίγουροι;'
      )
    ) {
      return;
    }

    setIsRegenerating(true);
    try {
      const response = await fetch('/api/admin/learning-paths/regenerate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobIds: [Number(jobId)],
          regenerate: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
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

  const startEdit = (skill: JobSkill) => {
    setEditingSkill(skill);
    setNewProperties({
      is_essential: skill.is_essential,
    });
  };

  const essentialSkills = skills.filter((skill) => skill.is_essential);
  const nonEssentialSkills = skills.filter((skill) => !skill.is_essential);

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
              <Link href="/admin/jobs" className="text-gray-500 hover:text-gray-700">
                Εργασιακά Προφίλ
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
                <span className="ml-4 text-sm font-medium text-gray-900">{jobProfile?.title}</span>
              </div>
            </li>
          </ol>
        </nav>

        {jobProfile && (
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-900">{jobProfile.title}</h1>
            <p className="mt-1 line-clamp-3 text-sm text-gray-600">{jobProfile.description}</p>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              {jobProfile.isco_group && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  ISCO: {jobProfile.isco_group}
                </span>
              )}
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Επίπεδο {jobProfile.hierarchy_level}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Βασικές Δεξιότητες ({essentialSkills.length})
              </h3>
            </div>

            {essentialSkills.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">Δεν έχουν οριστεί βασικές δεξιότητες.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {essentialSkills.map((skill) => (
                  <div
                    key={skill.skill_id}
                    className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{skill.skill_name}</div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Βασική
                        </span>
                        {skill.is_digital_skill && (
                          <span className="inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Ψηφιακή
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(skill)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        onClick={() => handleRemoveSkill(skill.skill_id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Αφαίρεση
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white shadow">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Επιπλέον Δεξιότητες ({nonEssentialSkills.length})
              </h3>
            </div>

            {nonEssentialSkills.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-500">Δεν έχουν οριστεί επιπλέον δεξιότητες.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nonEssentialSkills.map((skill) => (
                  <div
                    key={skill.skill_id}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{skill.skill_name}</div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                          Επιπλέον
                        </span>
                        {skill.is_digital_skill && (
                          <span className="inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Ψηφιακή
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(skill)}
                        className="text-sm text-indigo-600 hover:text-indigo-900"
                      >
                        Επεξεργασία
                      </button>
                      <button
                        onClick={() => handleRemoveSkill(skill.skill_id)}
                        className="text-sm text-red-600 hover:text-red-900"
                      >
                        Αφαίρεση
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Ενέργειες</h3>
              <p className="mt-1 text-sm text-gray-600">
                Διαχειριστείτε τις δεξιότητες και τα μαθησιακά μονοπάτια για αυτό το εργασιακό
                προφίλ
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-md bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
              >
                Προσθήκη Δεξιότητας
              </button>
              <button
                onClick={handleRegenerateLearningPaths}
                disabled={isRegenerating}
                className="rounded-md bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:bg-gray-400"
              >
                {isRegenerating ? 'Αναδημιουργία...' : 'Αναδημιουργία Μαθησιακών Μονοπατιών'}
              </button>
            </div>
          </div>
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

              <div className="mb-4">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Τύπος Δεξιότητας
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={newProperties.is_essential}
                      onChange={() => setNewProperties((prev) => ({ ...prev, is_essential: true }))}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Βασική</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!newProperties.is_essential}
                      onChange={() =>
                        setNewProperties((prev) => ({ ...prev, is_essential: false }))
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Επιπλέον</span>
                  </label>
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
                          <span className="ml-2 inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                            Ψηφιακή
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
                    setNewProperties({ is_essential: true });
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

              <div className="mb-4">
                <label className="mb-3 block text-sm font-medium text-gray-700">
                  Τύπος Δεξιότητας
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={newProperties.is_essential}
                      onChange={() => setNewProperties((prev) => ({ ...prev, is_essential: true }))}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Βασική</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      checked={!newProperties.is_essential}
                      onChange={() =>
                        setNewProperties((prev) => ({ ...prev, is_essential: false }))
                      }
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Επιπλέον</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setNewProperties({ is_essential: true });
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
