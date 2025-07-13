'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Skill {
  id: number;
  preferred_label: string;
  is_essential: boolean;
  is_digital_skill?: boolean;
}

interface Course {
  id: number;
  name: string;
  institution_name: string;
  skills?: Skill[];
  isLastEssentialCourse?: boolean;
}

interface LearningPath {
  id: number;
  courses: Course[];
  covered_essential_skills: number;
  total_essential_skills: number;
  covered_non_essential_skills: number;
  total_non_essential_skills: number;
  essential_skills_match_percent: number;
}

interface LearningPathVisualMapProps {
  learningPaths: LearningPath[];
  hasOptionalSkills: boolean;
  essentialSkills: Skill[];
  optionalSkills: Skill[];
}

interface NodePosition {
  x: number;
  y: number;
  id: string;
  type: 'start' | 'course' | 'goal';
  data?: Course | LearningPath;
  pathIndex?: number;
  courseIndex?: number;
  width?: number;
  size?: number;
}

export function LearningPathVisualMap({
  learningPaths,
  hasOptionalSkills,
  essentialSkills,
  optionalSkills,
}: LearningPathVisualMapProps) {
  const [selectedPath, setSelectedPath] = useState<number | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getPathColor = (pathIndex: number) => {
    const colors = [
      { primary: '#3B82F6', secondary: '#8B5CF6', light: '#DBEAFE', border: '#93C5FD' },
      { primary: '#10B981', secondary: '#059669', light: '#D1FAE5', border: '#6EE7B7' },
      { primary: '#F59E0B', secondary: '#D97706', light: '#FEF3C7', border: '#FCD34D' },
      { primary: '#EF4444', secondary: '#DC2626', light: '#FEE2E2', border: '#FCA5A5' },
    ];
    return colors[pathIndex % colors.length];
  };

  // Calculate node positions for the flow graph
  useEffect(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.offsetWidth;
    const minContainerHeight = 400;
    const pathVerticalSpacing = 150;
    const containerHeight = Math.max(
      minContainerHeight,
      learningPaths.length * pathVerticalSpacing + 200
    );
    const nodeWidth = 180;
    const nodeHeight = 100;
    const horizontalSpacing = 50;

    const calculatedNodes: NodePosition[] = [];

    // Start node - smaller on mobile
    const startNodeSize = containerWidth < 768 ? 60 : 80;
    const startNodeX = containerWidth < 768 ? 30 : 50;
    calculatedNodes.push({
      id: 'start',
      type: 'start',
      x: startNodeX,
      y: containerHeight / 2,
      size: startNodeSize,
    });

    // Calculate positions for each learning path
    const pathCount = learningPaths.length;
    const pathStartY = pathCount === 1 ? containerHeight / 2 : 100;
    const pathSpacing = pathCount === 1 ? 0 : (containerHeight - 200) / (pathCount - 1);

    learningPaths.forEach((path, pathIndex) => {
      const pathY = pathStartY + pathIndex * pathSpacing;
      const coursesCount = path.courses.length;

      // Calculate available horizontal space for courses - responsive
      const startNodeWidth = containerWidth < 768 ? 70 : 100; // Space for start node
      const goalNodeWidth = containerWidth < 768 ? 70 : 100; // Space for goal node
      const margins = containerWidth < 768 ? 40 : 100; // Total margins
      const availableWidth = containerWidth - startNodeWidth - goalNodeWidth - margins;

      // Calculate course spacing and size based on number of courses
      const minCourseWidth = 120;
      const maxCourseWidth = 200;
      const minSpacing = 20;

      let courseWidth = Math.max(
        minCourseWidth,
        Math.min(maxCourseWidth, (availableWidth - (coursesCount - 1) * minSpacing) / coursesCount)
      );
      let courseSpacing = Math.max(
        minSpacing,
        (availableWidth - coursesCount * courseWidth) / (coursesCount - 1)
      );

      // If courses still don't fit, reduce spacing further
      if (coursesCount * courseWidth + (coursesCount - 1) * courseSpacing > availableWidth) {
        courseSpacing = minSpacing;
        courseWidth = (availableWidth - (coursesCount - 1) * courseSpacing) / coursesCount;
      }

      // Add course nodes for this path
      const courseStartX = containerWidth < 768 ? startNodeWidth + 20 : startNodeWidth + 50;
      path.courses.forEach((course, courseIndex) => {
        calculatedNodes.push({
          id: `course-${pathIndex}-${courseIndex}`,
          type: 'course',
          x: courseStartX + courseIndex * (courseWidth + courseSpacing) + courseWidth / 2,
          y: pathY,
          data: course,
          pathIndex,
          courseIndex,
          width: courseWidth,
        });
      });
    });

    // Goal node - smaller on mobile
    const goalNodeSize = containerWidth < 768 ? 80 : 100;
    const goalNodeX = containerWidth < 768 ? containerWidth - 40 : containerWidth - 100;
    calculatedNodes.push({
      id: 'goal',
      type: 'goal',
      x: goalNodeX,
      y: containerHeight / 2,
      size: goalNodeSize,
    });

    setNodes(calculatedNodes);
  }, [learningPaths]);

  // Get connections between nodes
  const getConnections = () => {
    const connections: Array<{ from: NodePosition; to: NodePosition; pathIndex: number }> = [];

    nodes.forEach((node) => {
      if (node.type === 'start') {
        // Connect start to first course of each path
        learningPaths.forEach((_, pathIndex) => {
          const firstCourse = nodes.find((n) => n.id === `course-${pathIndex}-0`);
          if (firstCourse) {
            connections.push({ from: node, to: firstCourse, pathIndex });
          }
        });
      } else if (node.type === 'course') {
        // Connect to next course in path
        const nextCourse = nodes.find(
          (n) => n.id === `course-${node.pathIndex}-${(node.courseIndex || 0) + 1}`
        );
        if (nextCourse) {
          connections.push({ from: node, to: nextCourse, pathIndex: node.pathIndex! });
        } else {
          // Last course connects to goal
          const goalNode = nodes.find((n) => n.id === 'goal');
          if (goalNode) {
            connections.push({ from: node, to: goalNode, pathIndex: node.pathIndex! });
          }
        }
      }
    });

    return connections;
  };

  // Show different layout for mobile vs desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    // Mobile: Show original layout from git diff
    return (
      <div className="space-y-12">
        {learningPaths.map((path, pathIndex) => (
          <div
            key={path.id}
            id={`learning-path-${path.id}`}
            className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
          >
            {/* Path Header with Visual Progress */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Επιλογή {pathIndex + 1}</h3>
                  <p className="mt-1 text-gray-600">
                    Αυτή η μαθησιακή διαδρομή αποτελείται από{' '}
                    <span className="font-bold">{path.courses.length} μαθήματα</span> που καλύπτουν:
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
                    essentialCompleteIndex >= 0 && essentialCompleteIndex < path.courses.length - 1;
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
                    essentialCompleteIndex >= 0 && essentialCompleteIndex < path.courses.length - 1;
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
    );
  }

  // Desktop: Show flow graph
  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8"
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900">Μαθησιακές Διαδρομές</h3>
        <p className="mt-2 text-gray-600">
          Ακολουθήστε μία από τις διαδρομές για να αποκτήσετε τις απαιτούμενες δεξιότητες
        </p>
      </div>
      {/* Flow Graph */}
      <div
        className="relative"
        style={{ height: `${Math.max(400, learningPaths.length * 150 + 200)}px` }}
      >
        {/* SVG for connections */}
        <svg
          ref={svgRef}
          className="pointer-events-none absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        >
          {nodes.length > 0 &&
            getConnections().map((connection, index) => {
              const isHighlighted = selectedPath === null || selectedPath === connection.pathIndex;
              const pathColor = getPathColor(connection.pathIndex);

              return (
                <motion.path
                  key={`connection-${index}`}
                  d={`M ${connection.from.x} ${connection.from.y} Q ${(connection.from.x + connection.to.x) / 2} ${connection.from.y} ${connection.to.x} ${connection.to.y}`}
                  fill="none"
                  stroke={isHighlighted ? pathColor.primary : '#E5E7EB'}
                  strokeWidth={isHighlighted ? 3 : 2}
                  strokeDasharray={isHighlighted ? '0' : '5 5'}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              );
            })}
        </svg>

        {/* Graph Nodes */}
        <AnimatePresence>
          {nodes.map((node) => {
            if (node.type === 'start') {
              const size = node.size || 80;
              return (
                <motion.div
                  key={node.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: node.x - size / 2,
                    top: node.y - size / 2,
                    width: size,
                    height: size,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg">
                    <span className="text-sm font-bold text-white">Αρχή</span>
                  </div>
                </motion.div>
              );
            }

            if (node.type === 'goal') {
              const size = node.size || 100;
              return (
                <motion.div
                  key={node.id}
                  className="absolute flex items-center justify-center"
                  style={{
                    left: node.x - size / 2,
                    top: node.y - size / 2,
                    width: size,
                    height: size,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: nodes.length * 0.05 }}
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl">
                    <div className="text-center">
                      <span className="text-sm font-bold text-white">Στόχος</span>
                      <div className="mt-1 text-xs text-white">Έτοιμος/η!</div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            if (node.type === 'course' && node.data) {
              const course = node.data as Course;
              const pathColor = getPathColor(node.pathIndex!);
              const isHighlighted = selectedPath === null || selectedPath === node.pathIndex;
              const isHovered = hoveredNode === node.id;
              const courseWidth = node.width || 180;

              return (
                <motion.div
                  key={node.id}
                  className={`absolute cursor-pointer ${isHovered ? 'z-50' : 'z-10'}`}
                  style={{
                    left: node.x - courseWidth / 2,
                    top: node.y - 50,
                    width: courseWidth,
                    height: 100,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isHighlighted ? 1 : 0.9,
                    opacity: isHighlighted ? 1 : 0.6,
                  }}
                  transition={{ delay: 0.3 + node.courseIndex! * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={() => setSelectedPath(node.pathIndex!)}
                >
                  <div
                    className={`h-full w-full rounded-xl border-2 p-3 transition-all duration-300 ${
                      isHighlighted ? 'shadow-lg' : 'shadow-md'
                    }`}
                    style={{
                      borderColor: isHighlighted ? pathColor.border : '#E5E7EB',
                      backgroundColor: isHighlighted ? 'white' : '#F9FAFB',
                    }}
                  >
                    <div className="flex h-full flex-col justify-between">
                      <div>
                        <h6 className="line-clamp-2 text-xs font-semibold text-gray-900">
                          {course.name}
                        </h6>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {course.institution_name}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {course.skills?.length || 0} δεξιότητες
                        </span>
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                          style={{ backgroundColor: pathColor.primary }}
                        >
                          {(node.courseIndex || 0) + 1}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover tooltip */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        className="absolute z-50 w-64 rounded-lg border border-gray-200 bg-white p-4 shadow-xl"
                        style={{ top: '110%', left: '50%', transform: 'translateX(-50%)' }}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        onMouseEnter={() => setHoveredNode(node.id)}
                        onMouseLeave={() => setHoveredNode(null)}
                      >
                        <h6 className="mb-2 text-sm font-semibold text-gray-900">{course.name}</h6>
                        <p className="mb-2 text-xs text-gray-600">{course.institution_name}</p>
                        {course.skills && course.skills.length > 0 && (
                          <div>
                            <p className="mb-1 text-xs font-medium text-gray-700">
                              Δεξιότητες που καλύπτει:
                            </p>
                            <div className="space-y-1">
                              {course.skills.slice(0, 3).map((skill) => (
                                <div
                                  key={skill.id}
                                  className={`rounded px-2 py-1 text-xs ${
                                    skill.is_essential
                                      ? 'bg-indigo-100 text-indigo-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {skill.preferred_label}
                                </div>
                              ))}
                              {course.skills.length > 3 && (
                                <p className="text-xs text-gray-500">
                                  +{course.skills.length - 3} περισσότερες
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        <Link
                          href={`/courses/${course.id}`}
                          className="mt-3 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Δείτε λεπτομέρειες →
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            }

            return null;
          })}
        </AnimatePresence>
      </div>

      {/* Path Selector */}
      <div className="mt-8 rounded-xl border border-gray-200 bg-white/80 p-4">
        <h4 className="mb-3 text-sm font-semibold text-gray-900">
          Επιλέξτε διαδρομή για λεπτομέρειες:
        </h4>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedPath(null)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              selectedPath === null
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Όλες οι διαδρομές
          </button>
          {learningPaths.map((path, index) => {
            const pathColor = getPathColor(index);
            return (
              <button
                key={path.id}
                onClick={() => setSelectedPath(index)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                  selectedPath === index
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedPath === index ? pathColor.primary : undefined,
                }}
              >
                Διαδρομή {index + 1} ({path.essential_skills_match_percent}% κάλυψη)
              </button>
            );
          })}
        </div>

        {selectedPath !== null && (
          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Διαδρομή {selectedPath + 1}: {learningPaths[selectedPath].courses.length} μαθήματα
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Καλύπτει {learningPaths[selectedPath].covered_essential_skills} από{' '}
                  {essentialSkills.length} απαραίτητες δεξιότητες
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
