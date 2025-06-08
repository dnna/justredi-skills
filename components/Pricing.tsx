'use client';

import { useState } from 'react';
import { Radio, RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Logomark } from '@/components/Logo';

function CheckIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M9.307 12.248a.75.75 0 1 0-1.114 1.004l1.114-1.004ZM11 15.25l-.557.502a.75.75 0 0 0 1.15-.043L11 15.25Zm4.844-5.041a.75.75 0 0 0-1.188-.918l1.188.918Zm-7.651 3.043 2.25 2.5 1.114-1.004-2.25-2.5-1.114 1.004Zm3.4 2.457 4.25-5.5-1.187-.918-4.25 5.5 1.188.918Z"
        fill="currentColor"
      />
      <circle
        cx="12"
        cy="12"
        r="8.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LearningPathCard({
  name,
  description,
  button,
  skills,
  jobTitle,
  courseCount,
  featured = false,
}: {
  name: string;
  description: string;
  button: {
    label: string;
    href: string;
  };
  skills: Array<{
    id: string;
    preferred_label: string;
    skill_type: string;
    is_digital_skill: boolean;
  }>;
  jobTitle: string;
  courseCount: number;
  featured?: boolean;
}) {
  return (
    <section className="flex h-full flex-col overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-900/5 transition-all duration-300 hover:scale-105 hover:shadow-xl">
      <h3 className="text-xl font-semibold leading-tight text-gray-900">{jobTitle}</h3>

      <p className="mt-3 line-clamp-3 min-h-[60px] text-sm text-gray-700">{description}</p>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          {courseCount} courses
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {skills.length} skills
        </div>
      </div>

      <div className="mt-6 flex-grow">
        <h4 className="mb-3 text-sm font-medium text-gray-800">Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 6).map((skill, index) => (
            <span
              key={skill.id}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
            >
              {!!skill.is_digital_skill && (
                <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          {skills.length > 6 && (
            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium text-gray-500">
              +{skills.length - 6} more
            </span>
          )}
        </div>
      </div>

      <Button href={button.href} color="gray" className="mt-6">
        {button.label}
      </Button>
    </section>
  );
}

export function FeaturedLearningPaths({ learningPaths = [] }: { learningPaths?: any[] }) {
  // Create learning path items from database data
  const pathItems =
    learningPaths.length > 0
      ? learningPaths.slice(0, 3).map((path, index) => ({
          name: path.name || 'Learning Path',
          description: path.description || `Structured learning path for ${path.job_title}`,
          jobTitle: path.job_title || 'Various Roles',
          courseCount: path.course_count || 0,
          skills: path.skills || [],
          button: {
            label: 'Explore',
            href: `/job-profiles/${path.job_id}#learning-path-${path.id}`,
          },
        }))
      : [];

  return (
    <section
      id="learning-paths"
      aria-labelledby="learning-paths-title"
      className="border-t border-gray-200 bg-gray-900 py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="learning-paths-title" className="text-3xl font-medium tracking-tight text-white">
            Featured Learning Paths
          </h2>
          <p className="mt-2 text-lg text-gray-100">
            Discover structured learning journeys with the highest skill alignment scores.
          </p>
        </div>

        {pathItems.length > 0 ? (
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 items-stretch gap-x-8 gap-y-10 sm:mt-20 lg:max-w-none lg:grid-cols-3">
            {pathItems.map((path, index) => (
              <LearningPathCard key={path.name + index} {...path} />
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-lg text-gray-300">
              No learning paths available. Please check back later.
            </p>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Button href="/job-profiles" color="green">
            See all job profiles
          </Button>
        </div>
      </Container>
    </section>
  );
}
