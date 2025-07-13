'use client';

import Link from 'next/link';
import { Popover, PopoverButton, PopoverBackdrop, PopoverPanel } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

import { Button } from '@/components/Button';
import { Container } from '@/components/Container';
import { Logo } from '@/components/Logo';
import { NavLinks } from '@/components/NavLinks';
import { CategorySkillsModal } from '@/components/CategorySkillsModal';
import { CategoryJobProfilesModal } from '@/components/CategoryJobProfilesModal';
import type { CategoryItem } from '@/lib/categories';

function MenuIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 6h14M5 18h14M5 12h14"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronUpIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M17 14l-5-5-5 5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobileNavLink(
  props: Omit<React.ComponentPropsWithoutRef<typeof PopoverButton<typeof Link>>, 'as' | 'className'>
) {
  return (
    <PopoverButton
      as={Link}
      className="block text-base leading-7 tracking-tight text-gray-700"
      {...props}
    />
  );
}

export function Header() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isSkillsModalOpen, setIsSkillsModalOpen] = useState(false);
  const [isJobProfilesModalOpen, setIsJobProfilesModalOpen] = useState(false);

  const openSkillsModal = () => {
    setIsSkillsModalOpen(true);
  };

  const closeSkillsModal = () => {
    setIsSkillsModalOpen(false);
  };

  const openJobProfilesModal = () => {
    setIsJobProfilesModalOpen(true);
  };

  const closeJobProfilesModal = () => {
    setIsJobProfilesModalOpen(false);
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <header>
      <nav>
        <Container className="relative z-50 flex justify-between py-8">
          <div className="relative z-10 flex items-center gap-16">
            <Link href="/" aria-label="Αρχική">
              <Logo className="h-10 w-auto" />
            </Link>
            <div className="hidden lg:flex lg:gap-10">
              <NavLinks
                categories={categories}
                onOpenSkillsModal={openSkillsModal}
                onOpenJobProfilesModal={openJobProfilesModal}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://greece20.gov.gr/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block"
            >
              <img
                src="/greece-2.0-nextgeneration.png"
                alt="Greece 2.0 NextGeneration"
                className="h-12 w-auto hover:opacity-80 transition-opacity"
              />
            </Link>
            <Popover className="lg:hidden">
              {({ open }) => (
                <>
                  <PopoverButton
                    className="relative z-10 -m-2 inline-flex items-center rounded-lg stroke-gray-900 p-2 hover:bg-gray-200/50 hover:stroke-gray-600 active:stroke-gray-900 ui-not-focus-visible:outline-none"
                    aria-label="Εναλλαγή ναβιγάτες"
                  >
                    {({ open }) =>
                      open ? (
                        <ChevronUpIcon className="h-6 w-6" />
                      ) : (
                        <MenuIcon className="h-6 w-6" />
                      )
                    }
                  </PopoverButton>
                  <AnimatePresence initial={false}>
                    {open && (
                      <>
                        <PopoverBackdrop
                          static
                          as={motion.div}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-0 bg-gray-300/60 backdrop-blur"
                        />
                        <PopoverPanel
                          static
                          as={motion.div}
                          initial={{ opacity: 0, y: -32 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{
                            opacity: 0,
                            y: -32,
                            transition: { duration: 0.2 },
                          }}
                          className="absolute inset-x-0 top-0 z-0 origin-top rounded-b-2xl bg-gray-50 px-6 pb-6 pt-32 shadow-2xl shadow-gray-900/20"
                        >
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <p className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                                Εξερευνήστε
                              </p>
                              <button
                                className="block w-full text-left text-base leading-7 tracking-tight text-gray-700 hover:text-gray-900"
                                onClick={() => {
                                  openJobProfilesModal();
                                }}
                              >
                                Εργασιακά προφίλ
                              </button>
                              <button
                                className="block w-full text-left text-base leading-7 tracking-tight text-gray-700 hover:text-gray-900"
                                onClick={() => {
                                  openSkillsModal();
                                }}
                              >
                                Δεξιότητες
                              </button>
                            </div>
                          </div>
                          <div className="mt-8 flex flex-col gap-4">
                            {/*<Button href="/login" variant="outline">*/}
                            {/*  Log in*/}
                            {/*</Button>*/}
                          </div>
                        </PopoverPanel>
                      </>
                    )}
                  </AnimatePresence>
                </>
              )}
            </Popover>
            {/*<Button href="/login" variant="outline" className="hidden lg:block">*/}
            {/*  Log in*/}
            {/*</Button>*/}
          </div>
        </Container>
      </nav>

      {/* Modals - shown for both mobile and desktop */}
      <CategorySkillsModal
        isOpen={isSkillsModalOpen}
        onClose={closeSkillsModal}
        categories={categories}
      />
      <CategoryJobProfilesModal isOpen={isJobProfilesModalOpen} onClose={closeJobProfilesModal} />
    </header>
  );
}
