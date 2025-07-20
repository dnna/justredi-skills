import Link from 'next/link';
import { ReactNode } from 'react';
import AdminAuthWrapper from '@/components/AdminAuthWrapper';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="hidden sm:block">
          <nav className="border-b border-gray-200 bg-white shadow-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex space-x-8">
                  <Link
                    href="/admin"
                    className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                  >
                    Επισκόπηση
                  </Link>
                  <Link
                    href="/admin/courses"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Μαθήματα
                  </Link>
                  <Link
                    href="/admin/jobs"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Εργασιακά Προφίλ
                  </Link>
                  <Link
                    href="/admin/learning-paths"
                    className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  >
                    Μαθησιακά Μονοπάτια
                  </Link>
                </div>
                <div className="flex items-center">
                  <Link href="/" className="text-sm font-medium text-gray-500 hover:text-gray-700">
                    Πίσω στην κύρια σελίδα
                  </Link>
                </div>
              </div>
            </div>
          </nav>
        </div>

        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </AdminAuthWrapper>
  );
}
