"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { CategoryItem } from "@/lib/categories";

type NavLinksProps = {
  categories: CategoryItem[];
  onOpenCategoryModal: () => void;
};

export function NavLinks({ categories = [], onOpenCategoryModal }: NavLinksProps) {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  let timeoutRef = useRef<number | null>(null);

  return (
    <>
      <button
        onClick={onOpenCategoryModal}
        className="relative -mx-3 -my-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors delay-150 hover:text-gray-900 hover:delay-0"
        onMouseEnter={() => {
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current);
          }
          setHoveredIndex(0);
        }}
        onMouseLeave={() => {
          timeoutRef.current = window.setTimeout(() => {
            setHoveredIndex(null);
          }, 200);
        }}
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
        <span className="relative z-10">Categories</span>
      </button>
    </>
  );
}