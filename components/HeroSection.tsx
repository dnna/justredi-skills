'use client';

import { useState } from 'react';
import { Hero } from '@/components/Hero';
import { CategoryJobProfilesModal } from '@/components/CategoryJobProfilesModal';

export function HeroSection() {
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

  const openCategoryModal = () => {
    setCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setCategoryModalOpen(false);
  };

  return (
    <>
      <Hero onOpenCategoryModal={openCategoryModal} />
      <CategoryJobProfilesModal isOpen={isCategoryModalOpen} onClose={closeCategoryModal} />
    </>
  );
}
