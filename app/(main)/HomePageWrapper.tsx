'use client';

import { useState } from 'react';
import React from 'react';
import { Hero } from '@/components/Hero';
import { CategoryModal } from '@/components/CategoryModal';
import type { CategoryItem } from '@/lib/categories';

type HomePageWrapperProps = {
  children: React.ReactNode;
  categories: CategoryItem[];
};

export function HomePageWrapper({ children, categories }: HomePageWrapperProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const openCategoryModal = () => {
    console.log('Opening modal from hero');
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
  };

  return (
    <>
      <Hero onOpenCategoryModal={openCategoryModal} />

      {/* Render the FeaturedCourses and other components but skip the Hero */}
      {React.Children.toArray(children).slice(1)}

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={closeCategoryModal}
        categories={categories}
      />
    </>
  );
}
