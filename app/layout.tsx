import { type Metadata } from 'next';
import { Inter } from 'next/font/google';
import clsx from 'clsx';

import '@/styles/tailwind.css';

const inter = Inter({
  subsets: ['latin', 'greek'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s - JustReDI Skills',
    default: 'JustReDI Skills',
  },
  description:
    'Ανθεκτικότητα, Συμπερίληψη και Ανάπτυξη. Προς μια Δίκαιη Πράσινη και Ψηφιακή Μετάβαση των Ελληνικών Περιφερειών',
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={clsx('h-full w-full bg-gray-50 antialiased', inter.variable)}>
      <body className="h-full w-full">{children}</body>
    </html>
  );
}
