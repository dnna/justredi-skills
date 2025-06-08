'use client';

import { useState } from 'react';
import React from 'react';
import { Hero } from '@/components/Hero';
import { CategoryJobProfilesModal } from '@/components/CategoryJobProfilesModal';

type HomePageWrapperProps = {
  children: React.ReactNode;
};

export function HomePageWrapper({ children }: HomePageWrapperProps) {
  const [isJobProfilesModalOpen, setIsJobProfilesModalOpen] = useState(false);

  const openJobProfilesModal = () => {
    console.log('Opening job profiles modal from hero');
    setIsJobProfilesModalOpen(true);
  };

  const closeJobProfilesModal = () => {
    setIsJobProfilesModalOpen(false);
  };

  return (
    <>
      <Hero onOpenCategoryModal={openJobProfilesModal} />

      {/* Render the FeaturedCourses and other components but skip the Hero */}
      {React.Children.toArray(children).slice(1)}

      <CategoryJobProfilesModal
        isOpen={isJobProfilesModalOpen}
        onClose={closeJobProfilesModal}
      />
    </>
  );
}
