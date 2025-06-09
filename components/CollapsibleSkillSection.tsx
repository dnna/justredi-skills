'use client';

import Link from 'next/link';
import { useState } from 'react';

interface CollapsibleSkillSectionProps {
  title: string;
  skills: any[];
  count: number;
  isExpanded?: boolean;
  skillColorClass: string;
}

export function CollapsibleSkillSection({
  title,
  skills,
  count,
  isExpanded: defaultExpanded = false,
  skillColorClass,
}: CollapsibleSkillSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-left"
      >
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-600">
          {title} ({count})
        </h3>
      </button>
      {isExpanded && (
        <div className="mt-2 flex flex-wrap gap-1">
          {skills.map((skill: any) => (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium transition-colors ${skillColorClass}`}
              title={skill.description}
            >
              {skill.preferred_label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
