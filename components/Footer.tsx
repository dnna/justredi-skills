import Image from 'next/image';

import heroImage from '@/images/logo_square.jpg';
import { Container } from '@/components/Container';
import { Logomark } from '@/components/Logo';
import { NavLinks } from '@/components/NavLinks';
import Link from 'next/link';

function QrCodeBorder(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg viewBox="0 0 96 96" fill="none" aria-hidden="true" {...props}>
      <path
        d="M1 17V9a8 8 0 0 1 8-8h8M95 17V9a8 8 0 0 0-8-8h-8M1 79v8a8 8 0 0 0 8 8h8M95 79v8a8 8 0 0 1-8 8h-8"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <Container>
        <div className="flex flex-col items-start justify-between gap-y-12 pb-6 pt-16 lg:flex-row lg:items-center lg:py-16">
          <div>
            <div className="flex items-center text-gray-900">
              <div className="ml-4">
                <p className="text-base font-semibold">JustReDI</p>
                <p className="mt-1 text-sm">
                  Ανθεκτικότητα, Συμπερίληψη και Ανάπτυξη
                  <br />
                  Προς μια Δίκαιη Πράσινη και Ψηφιακή Μετάβαση των Ελληνικών Περιφερειών
                </p>
              </div>
            </div>
          </div>
          <div className="group relative -mx-4 flex items-center self-stretch p-4 transition-colors hover:bg-gray-100 sm:self-auto sm:rounded-2xl lg:mx-0 lg:self-auto lg:p-6">
            <Link
              href="https://www.justredi.gr/"
              className="relative flex h-48 w-48 flex-none items-center justify-center"
            >
              <Image src={heroImage} alt="Logo square" />
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center border-t border-gray-200 pb-12 pt-8 md:pt-6">
          {/*<form className="flex w-full justify-center md:w-auto">
            <TextField
              type="email"
              aria-label="Email address"
              placeholder="Email address"
              autoComplete="email"
              required
              className="w-60 min-w-0 shrink"
            />
            <Button type="submit" color="cyan" className="ml-4 flex-none">
              <span className="hidden lg:inline">Join our newsletter</span>
              <span className="lg:hidden">Join newsletter</span>
            </Button>
          </form>*/}
          <div className="mt-6 text-center">
            <p className="mb-4 max-w-4xl text-center text-xs leading-relaxed text-gray-400">
              Δράση ενίσχυσης επενδύσεων «Εμβληματικές δράσεις σε διαθεματικές επιστημονικές
              περιοχές με ειδικό ενδιαφέρον για την σύνδεση με τον παραγωγικό ιστό» / Ανθεκτικότητα,
              Συμπερίληψη και Ανάπτυξη: Προς μια Δίκαιη Πράσινη και Ψηφιακή Μετάβαση των Ελληνικών
              Περιφερειών – TAEDR-0537352.
              <br />
              <br />Η δράση υλοποιείται στο πλαίσιο του{' '}
              <Link
                href="https://greece20.gov.gr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 underline hover:text-gray-700"
              >
                Εθνικού Σχεδίου Ανάκαμψης και Ανθεκτικότητας Ελλάδα 2.0 με τη χρηματοδότηση της
                Ευρωπαϊκής Ένωσης – NextGenerationEU
              </Link>
              .
            </p>
            <p className="text-xs text-gray-500">
              &copy; Copyright {new Date().getFullYear()}. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
