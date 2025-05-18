import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

export default function Home() {
  return (
    <Layout>
      <Container className="mt-16 mb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            JustReDI Skills
          </h1>

          <p className="mt-6 text-lg leading-8 text-gray-600">
            Ανθεκτικότητα, Συμπερίληψη και Ανάπτυξη. Προς μια Δίκαιη Πράσινη και Ψηφιακή Μετάβαση
            των Ελληνικών Περιφερειών
          </p>

          <div className="mt-10 flex gap-x-6">
            <Button
              href="/courses"
              variant="filled"
              className="bg-indigo-600 text-white hover:bg-indigo-500"
            >
              Explore Courses
            </Button>
            <Button href="/skills" variant="outline">
              Browse Skills
            </Button>
          </div>
        </div>

        <div className="mt-20" id="categories">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Categories</h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link href="/courses" className="hover:text-indigo-600">
                  Courses
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Explore our catalog of courses from various educational institutions.
              </p>
              <div className="mt-4">
                <Link
                  href="/courses"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View all courses →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link href="/skills" className="hover:text-indigo-600">
                  Skills
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Discover skills that match your interests and career goals.
              </p>
              <div className="mt-4">
                <Link
                  href="/skills"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Explore skills →
                </Link>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-900">
                <Link href="/institutions" className="hover:text-indigo-600">
                  Course Providers
                </Link>
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Find educational institutions offering quality learning opportunities.
              </p>
              <div className="mt-4">
                <Link
                  href="/institutions"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View providers →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
