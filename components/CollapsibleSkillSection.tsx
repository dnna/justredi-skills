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
              {skill.is_digital_skill && (
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              )}
              {skill.is_green_skill && (
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              )}
              {skill.preferred_label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
