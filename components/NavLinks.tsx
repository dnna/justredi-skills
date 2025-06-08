'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { CategoryItem } from '@/lib/categories';

type NavLinksProps = {
  categories: CategoryItem[];
  onOpenSkillsModal: () => void;
  onOpenJobProfilesModal: () => void;
};

export function NavLinks({
  categories = [],
  onOpenSkillsModal,
  onOpenJobProfilesModal,
}: NavLinksProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    setHoveredIndex(0);
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = window.setTimeout(() => {
      setHoveredIndex(null);
      setIsDropdownOpen(false);
    }, 200);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="relative -mx-3 -my-2 flex items-center rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors delay-150 hover:text-gray-900 hover:delay-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <AnimatePresence>
          {hoveredIndex === 0 && (
            <motion.span
              className="absolute inset-0 rounded-lg bg-gray-100"
              layoutId="hoverBackground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{
                opacity: 0,
                transition: { duration: 0.15 },
              }}
            />
          )}
        </AnimatePresence>
        <span className="relative z-10">Explore</span>
        <svg
          className="ml-1 h-4 w-4 transition-transform"
          style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-50 mt-2 w-48 origin-top-left rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onOpenJobProfilesModal();
                  setIsDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Job Profiles
              </button>
              <button
                onClick={() => {
                  onOpenSkillsModal();
                  setIsDropdownOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              >
                Skills
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
