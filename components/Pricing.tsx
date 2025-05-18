'use client';

import { useState } from 'react';
import { Radio, RadioGroup } from '@headlessui/react';
import clsx from 'clsx';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Logomark } from '@/components/Logo';

const defaultCourses = [
  {
    name: 'Cloud Computing Course',
    featured: true,
    description: 'Learn cloud platforms to build scalable, fault-tolerant applications.',
    button: {
      label: 'Explore',
      href: '/courses',
    },
    features: ['Matches 40 job profiles'],
    logomarkClassName: 'fill-gray-300',
  },
  {
    name: 'Version Control Systems',
    featured: true,
    description:
      'Master Git and other tools for managing code changes and collaborating with other developers.',
    button: {
      label: 'Explore',
      href: '/courses',
    },
    features: ['Matches 35 job profiles'],
    logomarkClassName: 'fill-gray-500',
  },
  {
    name: 'Database Management',
    featured: true,
    description: 'Learn to design and manage databases for efficient data storage and retrieval.',
    button: {
      label: 'Explore',
      href: '/courses',
    },
    features: ['Matches 30 job profiles'],
    logomarkClassName: 'fill-cyan-500',
  },
];

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

function CourseCard({
  name,
  description,
  button,
  features,
  featured = false,
}: {
  name: string;
  description: string;
  button: {
    label: string;
    href: string;
  };
  features: Array<string>;
  featured?: boolean;
}) {
  return (
    <section
      className={clsx(
        'flex flex-col overflow-hidden rounded-3xl p-6 shadow-lg shadow-gray-900/5',
        featured ? 'order-first bg-gray-800 lg:order-none' : 'bg-white'
      )}
    >
      <h3
        className={clsx(
          'flex items-center text-2xl font-semibold',
          featured ? 'text-white' : 'text-gray-900'
        )}
      >
        <span>{name}</span>
      </h3>
      {/*<p className={clsx("relative mt-5 flex text-3xl tracking-tight", featured ? "text-white" : "text-gray-900")}>
        TEST
      </p>*/}
      <p
        className={clsx('mt-3 min-h-[70px] text-sm', featured ? 'text-gray-300' : 'text-gray-700')}
      >
        {description}
      </p>
      <div className="mt-6">
        <ul
          role="list"
          className={clsx(
            '-my-2 divide-y text-sm',
            featured ? 'divide-gray-800 text-gray-300' : 'divide-gray-200 text-gray-700'
          )}
        >
          {features.map((feature) => (
            <li key={feature} className="flex py-2">
              <CheckIcon
                className={clsx('h-6 w-6 flex-none', featured ? 'text-white' : 'text-[#59a946]')}
              />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <Button href={button.href} color={featured ? 'green' : 'gray'} className="mt-6">
        {button.label}
      </Button>
    </section>
  );
}

export function FeaturedCourses({ courses = [] }: { courses?: any[] }) {
  let [activePeriod, setActivePeriod] = useState<'Monthly' | 'Annually'>('Monthly');

  // Create course items from database data, fallback to defaults if no courses
  const courseItems =
    courses.length >= 3
      ? courses.slice(0, 3).map((course, index) => ({
          name: course.courseName || 'Course',
          featured: index === 0, // First course is featured
          description: `Course offered by ${course.institutionName || 'Unknown Institution'}`,
          button: {
            label: 'Explore',
            href: `/courses/${course.id}`,
          },
          features: [`Course ID: ${course.id}`],
          logomarkClassName:
            index === 0 ? 'fill-gray-300' : index === 1 ? 'fill-gray-500' : 'fill-cyan-500',
        }))
      : defaultCourses;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="border-t border-gray-200 bg-gray-900 py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="pricing-title" className="text-3xl font-medium tracking-tight text-white">
            Featured Courses
          </h2>
          <p className="mt-2 text-lg text-gray-100">
            Explore our most popular learning opportunities.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-10 sm:mt-20 lg:max-w-none lg:grid-cols-3">
          {courseItems.map((course) => (
            <CourseCard key={course.name} {...course} />
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button href="/courses" color="green">
            Explore all courses
          </Button>
        </div>
      </Container>
    </section>
  );
}
