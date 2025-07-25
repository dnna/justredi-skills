'use client';

import { useId } from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { CiSearch } from 'react-icons/ci';

function BackgroundIllustration(props: React.ComponentPropsWithoutRef<'div'>) {
  let id = useId();

  return (
    <div {...props}>
      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-spin-slow"
      >
        <path
          d="M1025 513c0 282.77-229.23 512-512 512S1 795.77 1 513 230.23 1 513 1s512 229.23 512 512Z"
          stroke="#D4D4D4"
          strokeOpacity="0.7"
        />
        <path
          d="M513 1025C230.23 1025 1 795.77 1 513"
          stroke={`url(#${id}-gradient-1)`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id={`${id}-gradient-1`}
            x1="1"
            y1="513"
            x2="1"
            y2="1025"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#58a942" />
            <stop offset="1" stopColor="#58a942" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        viewBox="0 0 1026 1026"
        fill="none"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full animate-spin-reverse-slower"
      >
        <path
          d="M913 513c0 220.914-179.086 400-400 400S113 733.914 113 513s179.086-400 400-400 400 179.086 400 400Z"
          stroke="#D4D4D4"
          strokeOpacity="0.7"
        />
        <path
          d="M913 513c0 220.914-179.086 400-400 400"
          stroke={`url(#${id}-gradient-2)`}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient
            id={`${id}-gradient-2`}
            x1="913"
            y1="513"
            x2="913"
            y2="913"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#58a942" />
            <stop offset="1" stopColor="#58a942" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

type HeroProps = {
  onOpenCategoryModal?: () => void;
};

export function Hero({ onOpenCategoryModal }: HeroProps) {
  const handleCategoryClick = () => {
    console.log('Category button clicked in Hero');
    if (onOpenCategoryModal) {
      onOpenCategoryModal();
    }
  };
  return (
    <div className="overflow-hidden pb-32 pt-16">
      <Container>
        <div className="gap-y-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
          <div className="relative z-10 mx-auto max-w-2xl lg:col-span-12 lg:max-w-none xl:col-span-12">
            <BackgroundIllustration className="absolute left-1/2 top-4 h-[1026px] w-[1026px] -translate-x-1/3 stroke-gray-300/70 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)] sm:top-16 sm:-translate-x-1/2 lg:-top-16 lg:ml-12 xl:-top-14 xl:ml-0" />
          </div>
          <div className="relative z-10 mx-auto max-w-2xl lg:col-span-12 lg:max-w-none xl:col-span-12">
            <h1 className="text-center text-2xl font-bold font-medium tracking-tight text-[#6DAB51]">
              Καλώς ήρθατε στο JustReDI Skills
            </h1>
          </div>
          <div className="relative z-10 mx-auto mt-10 max-w-2xl lg:col-span-12 lg:mt-0 lg:max-w-none xl:col-span-12">
            <h1 className="mx-auto text-center text-4xl font-medium tracking-tight text-gray-900 lg:w-4/5">
              Αναζητήστε εργασιακά προφίλ και ευκαιρίες μάθησης για να βελτιώσετε τις δεξιότητές σας
            </h1>
            <form
              action="/search"
              method="GET"
              className="mx-auto mt-10 flex w-2/3 flex-col items-center gap-4 lg:mt-0 lg:mt-8 lg:flex-row"
            >
              <button
                type="button"
                onClick={handleCategoryClick}
                className="flex cursor-pointer items-center justify-center rounded-md px-4 py-2 font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                Εξερευνήστε εργασιακά προφίλ <IoIosArrowDown className="ml-1 h-4 w-4" />
              </button>
              <div className="flex-grow">
                <input
                  type="text"
                  name="q"
                  placeholder="Αναζητήστε εργασιακά προφίλ, ευκαιρίες ή δεξιότητες"
                  className="w-full rounded border border-gray-300 p-2 text-sm text-gray-600"
                />
              </div>
              <div className="flex flex-wrap gap-x-6 gap-y-4">
                <Button type="submit" color="green">
                  <CiSearch className="h-6 w-6 flex-none" />
                  <span className="ml-2.5">Αναζήτηση</span>
                </Button>
              </div>
            </form>
          </div>
          {/*<div className="relative -mt-4 lg:col-span-12 lg:mt-0 xl:col-span-12">
            <p className="mt-12 text-center text-sm font-semibold text-gray-900 lg:mt-0 lg:text-left">
              Explore categories
            </p>
            <ul
              role="list"
              className="mx-auto mt-8 flex flex-wrap justify-center gap-x-10 gap-y-8 lg:mx-0 lg:justify-start"
            >
              {[
                ["Test 1"],
                ["Test 2"],
                ["Test 3"],
                ["Test 4", "hidden xl:block"],
                ["Test 5"],
                ["Test 6"],
                ["Test 7"],
                ["Test 8", "hidden xl:block"],
              ].map(([name, className]) => (
                <li key={name} className={clsx("flex", className)}>
                  <div className="p-3 shadow-lg">{name}</div>
                </li>
              ))}
            </ul>
          </div>*/}
        </div>
      </Container>
    </div>
  );
}
