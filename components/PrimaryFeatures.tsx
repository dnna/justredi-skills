'use client';

import React, { Fragment, useEffect, useId, useRef, useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import clsx from 'clsx';
import {
  type MotionProps,
  type Variant,
  type Variants,
  AnimatePresence,
  motion,
} from 'framer-motion';
import { useDebouncedCallback } from 'use-debounce';

import { AppScreen } from '@/components/AppScreen';
import { CircleBackground } from '@/components/CircleBackground';
import { Container } from '@/components/Container';
import { HeroFrame } from '@/components/HeroFrame';
import {
  DiageoLogo,
  LaravelLogo,
  MirageLogo,
  ReversableLogo,
  StatamicLogo,
  StaticKitLogo,
  TransistorLogo,
  TupleLogo,
} from '@/components/TechLogos';

const MotionAppScreenHeader = motion(AppScreen.Header);
const MotionAppScreenBody = motion(AppScreen.Body);

interface CustomAnimationProps {
  isForwards: boolean;
  changeCount: number;
}

// Default skills to display if no database skills are provided
const defaultSkills = [
  {
    name: 'Cloud Computing',
    description:
      'Understanding cloud platforms enables engineers to build scalable, fault-tolerant applications.',
    icon: DeviceUserIcon,
    screen: Top10PlatformsScreen,
  },
  {
    name: 'Version Control',
    description:
      'Proficiency in tools like Git is vital for managing code changes and collaborating with other developers.',
    icon: DeviceNotificationIcon,
    screen: Top10TechsScreen,
  },
  {
    name: 'Database Management',
    description:
      'Skills in designing and managing databases are crucial for handling data storage and retrieval.',
    icon: DeviceTouchIcon,
    screen: Top10DatabasesScreen,
  },
];

function DeviceUserIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 23a3 3 0 100-6 3 3 0 000 6zm-1 2a4 4 0 00-4 4v1a2 2 0 002 2h6a2 2 0 002-2v-1a4 4 0 00-4-4h-2z"
        fill="#737373"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4a4 4 0 014-4h14a4 4 0 014 4v24a4.002 4.002 0 01-3.01 3.877c-.535.136-.99-.325-.99-.877s.474-.98.959-1.244A2 2 0 0025 28V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9a2 2 0 00-2 2v24a2 2 0 001.041 1.756C8.525 30.02 9 30.448 9 31s-.455 1.013-.99.877A4.002 4.002 0 015 28V4z"
        fill="#A3A3A3"
      />
    </svg>
  );
}

function DeviceNotificationIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 0a4 4 0 00-4 4v24a4 4 0 004 4h14a4 4 0 004-4V4a4 4 0 00-4-4H9zm0 2a2 2 0 00-2 2v24a2 2 0 002 2h14a2 2 0 002-2V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9z"
        fill="#A3A3A3"
      />
      <path d="M9 8a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-2 2H11a2 2 0 01-2-2V8z" fill="#737373" />
    </svg>
  );
}

function DeviceTouchIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  let id = useId();

  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient
          id={`${id}-gradient`}
          x1={14}
          y1={14.5}
          x2={7}
          y2={17}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#737373" />
          <stop offset={1} stopColor="#D4D4D4" stopOpacity={0} />
        </linearGradient>
      </defs>
      <circle cx={16} cy={16} r={16} fill="#A3A3A3" fillOpacity={0.2} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 4a4 4 0 014-4h14a4 4 0 014 4v13h-2V4a2 2 0 00-2-2h-1.382a1 1 0 00-.894.553l-.448.894a1 1 0 01-.894.553h-6.764a1 1 0 01-.894-.553l-.448-.894A1 1 0 0010.382 2H9a2 2 0 00-2 2v24a2 2 0 002 2h4v2H9a4 4 0 01-4-4V4z"
        fill="#A3A3A3"
      />
      <path
        d="M7 22c0-4.694 3.5-8 8-8"
        stroke={`url(#${id}-gradient)`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 20l.217-5.513a1.431 1.431 0 00-2.85-.226L17.5 21.5l-1.51-1.51a2.107 2.107 0 00-2.98 0 .024.024 0 00-.005.024l3.083 9.25A4 4 0 0019.883 32H25a4 4 0 004-4v-5a3 3 0 00-3-3h-5z"
        fill="#A3A3A3"
      />
    </svg>
  );
}

const headerAnimation: Variants = {
  initial: { opacity: 0, transition: { duration: 0.3 } },
  animate: { opacity: 1, transition: { duration: 0.3, delay: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const maxZIndex = 2147483647;

const bodyVariantBackwards: Variant = {
  opacity: 0.4,
  scale: 0.8,
  zIndex: 0,
  filter: 'blur(4px)',
  transition: { duration: 0.4 },
};

const bodyVariantForwards: Variant = (custom: CustomAnimationProps) => ({
  y: '100%',
  zIndex: maxZIndex - custom.changeCount,
  transition: { duration: 0.4 },
});

const bodyAnimation: MotionProps = {
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  variants: {
    initial: (custom: CustomAnimationProps, ...props) =>
      custom.isForwards ? bodyVariantForwards(custom, ...props) : bodyVariantBackwards,
    animate: (custom: CustomAnimationProps) => ({
      y: '0%',
      opacity: 1,
      scale: 1,
      zIndex: maxZIndex / 2 - custom.changeCount,
      filter: 'blur(0px)',
      transition: { duration: 0.4 },
    }),
    exit: (custom: CustomAnimationProps, ...props) =>
      custom.isForwards ? bodyVariantBackwards : bodyVariantForwards(custom, ...props),
  },
};

type ScreenProps =
  | {
      animated: true;
      custom: CustomAnimationProps;
      data: Array<{ name?: string; amount?: string; color?: string; logo?: React.ComponentType }>;
    }
  | {
      animated?: false;
      data: Array<{ name?: string; amount?: string; color?: string; logo?: React.ComponentType }>;
    };

function Top10TechsScreen(props: ScreenProps) {
  // Fallback data in case no real data is provided
  const fallbackData = [
    {
      name: 'No related skills found',
      amount: 'N/A',
      color: '#F9322C',
    },
  ];

  // If we have data from props, use it instead
  const displayData = props.data && props.data.length > 0 ? props.data : fallbackData;
  return <Top10Screen {...props} data={displayData} title="Σχετικές Δεξιότητες" />;
}

function Top10PlatformsScreen(props: ScreenProps) {
  // Fallback data in case no real data is provided
  const fallbackData = [
    {
      name: 'No related skills found',
      amount: 'N/A',
      color: '#FF9900',
    },
  ];

  // If we have data from props, use it instead
  const displayData = props.data && props.data.length > 0 ? props.data : fallbackData;
  return <Top10Screen {...props} data={displayData} title="Παρόμοιες Δεξιότητες" />;
}

function Top10DatabasesScreen(props: ScreenProps) {
  // Fallback data in case no real data is provided
  const fallbackData = [
    {
      name: 'No job profiles found',
      amount: 'N/A',
      color: '#336791',
    },
  ];

  // If we have data from props, use it instead
  const displayData = props.data && props.data.length > 0 ? props.data : fallbackData;
  return <Top10Screen {...props} data={displayData} title="Εργασιακά προφίλ" />;
}

function Top10Screen(props: ScreenProps & { title?: string }) {
  // Get the data to display
  const displayData = props.data || [];
  const title = props.title || 'Related Data';

  return (
    <AppScreen className="w-full">
      <MotionAppScreenBody {...(props.animated ? { ...bodyAnimation, custom: props.custom } : {})}>
        <div className="divide-y divide-gray-100">
          <div className="bg-gray-50 px-4 py-3 text-center">
            <h3 className="font-semibold text-gray-900">{title}</h3>
          </div>
          {displayData.length > 0 ? (
            // If we have data, display it
            displayData.map((item) => (
              <div key={item.name} className="flex items-center gap-4 px-4 py-3">
                <div className="flex-auto text-sm text-gray-900">{item.name}</div>
                <div className="flex-none text-right">
                  <div className="text-sm font-medium text-gray-900">{item.amount}</div>
                </div>
              </div>
            ))
          ) : (
            // Fallback for no data
            <div className="flex items-center gap-4 px-4 py-3">
              <div className="flex-auto text-sm text-gray-700">Δεν βρέθηκαν σχετικά δεδομένα</div>
            </div>
          )}
        </div>
      </MotionAppScreenBody>
    </AppScreen>
  );
}

function usePrevious<T>(value: T) {
  let ref = useRef<T | null>(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

function SkillsDesktop({ skills }: { skills: typeof defaultSkills }) {
  let [changeCount, setChangeCount] = useState(0);
  let [selectedIndex, setSelectedIndex] = useState(0);
  let prevIndex = usePrevious(selectedIndex);
  // @ts-ignore
  let isForwards = prevIndex === undefined ? true : selectedIndex > prevIndex;

  let onChange = useDebouncedCallback(
    (selectedIndex) => {
      setSelectedIndex(selectedIndex);
      setChangeCount((changeCount) => changeCount + 1);
    },
    100,
    { leading: true }
  );

  return (
    <TabGroup
      className="grid grid-cols-12 items-center gap-8 lg:gap-16 xl:gap-24"
      selectedIndex={selectedIndex}
      onChange={onChange}
      vertical
    >
      <TabList className="relative z-10 order-last col-span-6 space-y-6">
        {skills.map((skill, skillIndex) => (
          <div
            key={skill.name}
            className="relative rounded-2xl transition-colors hover:bg-gray-800/30"
          >
            {skillIndex === selectedIndex && (
              <motion.div
                layoutId="activeBackground"
                className="absolute inset-0 bg-gray-800"
                initial={{ borderRadius: 16 }}
              />
            )}
            <div className="relative z-10 p-8">
              <skill.icon className="h-8 w-8" />
              <h3 className="mt-6 text-lg font-semibold text-white">
                <Tab className="text-left ui-not-focus-visible:outline-none">
                  <span className="absolute inset-0 rounded-2xl" />
                  {skill.name}
                </Tab>
              </h3>
              <p className="mt-2 text-sm text-gray-400">{skill.description}</p>
            </div>
          </div>
        ))}
      </TabList>
      <div className="relative col-span-6">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <CircleBackground color="#58a942" className="animate-spin-slower" />
        </div>
        <HeroFrame className="z-10 mx-auto w-full max-w-[366px]">
          <TabPanels as={Fragment}>
            <AnimatePresence initial={false} custom={{ isForwards, changeCount }}>
              {skills.map((skill, skillIndex) =>
                selectedIndex === skillIndex ? (
                  <TabPanel
                    static
                    key={skill.name + changeCount}
                    className="col-start-1 row-start-1 flex focus:outline-offset-[32px] ui-not-focus-visible:outline-none"
                  >
                    <skill.screen animated custom={{ isForwards, changeCount }} data={[]} />
                  </TabPanel>
                ) : null
              )}
            </AnimatePresence>
          </TabPanels>
        </HeroFrame>
      </div>
    </TabGroup>
  );
}

function SkillsMobile({ skills }: { skills: typeof defaultSkills }) {
  let [activeIndex, setActiveIndex] = useState(0);
  let slideContainerRef = useRef<React.ElementRef<'div'>>(null);
  let slideRefs = useRef<Array<React.ElementRef<'div'>>>([]);

  useEffect(() => {
    let observer = new window.IntersectionObserver(
      (entries) => {
        for (let entry of entries) {
          if (entry.isIntersecting && entry.target instanceof HTMLDivElement) {
            setActiveIndex(slideRefs.current.indexOf(entry.target));
            break;
          }
        }
      },
      {
        root: slideContainerRef.current,
        threshold: 0.6,
      }
    );

    for (let slide of slideRefs.current) {
      if (slide) {
        observer.observe(slide);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, [slideContainerRef, slideRefs]);

  return (
    <>
      <div
        ref={slideContainerRef}
        className="-mb-4 flex snap-x snap-mandatory -space-x-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 [scrollbar-width:none] sm:-space-x-6 [&::-webkit-scrollbar]:hidden"
      >
        {skills.map((skill, skillIndex) => (
          <div
            key={skillIndex}
            // @ts-ignore
            ref={(ref) => ref && (slideRefs.current[skillIndex] = ref)}
            className="w-full flex-none snap-center px-4 sm:px-6"
          >
            <div className="relative transform overflow-hidden rounded-2xl bg-gray-800 px-5 py-6">
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <CircleBackground
                  color="#13B5C8"
                  className={skillIndex % 2 === 1 ? 'rotate-180' : undefined}
                />
              </div>
              <HeroFrame className="relative mx-auto w-full max-w-[366px]">
                <skill.screen data={[]} />
              </HeroFrame>
              <div className="absolute inset-x-0 bottom-0 bg-gray-800/95 p-6 backdrop-blur sm:p-10">
                <skill.icon className="h-8 w-8" />
                <h3 className="mt-6 text-sm font-semibold text-white sm:text-lg">{skill.name}</h3>
                <p className="mt-2 text-sm text-gray-400">{skill.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 flex justify-center gap-3">
        {skills.map((_, skillIndex) => (
          <button
            type="button"
            key={skillIndex}
            className={clsx(
              'relative h-0.5 w-4 rounded-full',
              skillIndex === activeIndex ? 'bg-gray-300' : 'bg-gray-500'
            )}
            aria-label={`Go to slide ${skillIndex + 1}`}
            onClick={() => {
              slideRefs.current[skillIndex].scrollIntoView({
                block: 'nearest',
                inline: 'nearest',
              });
            }}
          >
            <span className="absolute -inset-x-1.5 -inset-y-3" />
          </button>
        ))}
      </div>
    </>
  );
}

export function TopSkills({ skills = [] }: { skills?: any[] }) {
  // Create skill items from database data
  const skillItems =
    skills.length >= 1
      ? skills.slice(0, 3).map((skill, index) => {
          // Prepare job profiles data
          const jobData =
            skill.jobProfiles?.map((job: any) => ({
              name: job.title,
              amount: 'Relevant',
              color: ['#FF9900', '#4285F4', '#00A2FF', '#13B5C8'][index % 4],
            })) || [];

          // Prepare related skills data
          const relatedSkillsData =
            skill.relatedSkills?.map((relatedSkill: any) => ({
              name: relatedSkill.preferred_label,
              amount: relatedSkill.skill_type === 'knowledge' ? 'Knowledge' : 'Skill',
              color: '#5A67D8',
            })) || [];

          // Choose the appropriate screen for each index and pass the relevant data
          let screenComponent;
          let screenData;

          switch (index % 3) {
            case 0: // First skill uses Top10PlatformsScreen to show related skills
              screenComponent = Top10PlatformsScreen;
              screenData = relatedSkillsData.slice(0, Math.min(relatedSkillsData.length, 4));
              break;
            case 1: // Second skill uses Top10TechsScreen to show more related skills
              screenComponent = Top10TechsScreen;
              screenData = relatedSkillsData.slice(
                Math.min(relatedSkillsData.length, 4),
                Math.min(relatedSkillsData.length, 8)
              );
              break;
            case 2: // Third skill uses Top10DatabasesScreen to show job profiles
              screenComponent = Top10DatabasesScreen;
              // Only use job data if there are actual job profiles
              screenData = jobData.length > 0 ? jobData : relatedSkillsData.slice(0, 4);
              break;
            default:
              screenComponent = Top10PlatformsScreen;
              screenData = relatedSkillsData;
          }

          return {
            name: skill.preferred_label || 'Skill',
            description: skill.description?.substring(0, 120) + '...' || 'No description available',
            icon: [DeviceUserIcon, DeviceNotificationIcon, DeviceTouchIcon][index % 3],
            screen: screenComponent,
            data: screenData,
          };
        })
      : defaultSkills;

  return (
    <section
      id="features"
      aria-label="Χαρακτηριστικά για την εξερεύνηση δεξιοτήτων"
      className="bg-gray-900 py-20 sm:py-32"
    >
      <Container>
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-3xl">
          <h2 className="text-3xl font-medium tracking-tight text-white">Κεντρικές Δεξιότητες</h2>
          <p className="mt-2 text-lg text-gray-400">
            Εξερευνήστε αυτές τις δεξιότητες και τις σχετικές επαγγελματικές ευκαιρίες.
          </p>
        </div>
      </Container>
      <div className="mt-16 md:hidden">
        <SkillsMobile skills={skillItems} />
      </div>
      <Container className="hidden md:mt-20 md:block">
        <SkillsDesktop skills={skillItems} />
      </Container>
    </section>
  );
}
