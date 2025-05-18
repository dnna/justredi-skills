import Link from 'next/link';
import { getAllCourses } from '@/lib/db';
import { Container } from '@/components/Container';

export default async function CoursesPage() {
  const courses = await getAllCourses(100, 0);

  return (
    <Container className="mt-16 mb-24">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Courses</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Browse our catalog of courses to find learning opportunities that match your interests and
        career goals.
      </p>

      <div className="mt-10 space-y-12 divide-y divide-gray-200">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course.id} className="pt-10 pb-8">
              <h3 className="text-xl font-semibold text-gray-900">
                <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                  {course.courseName}
                </Link>
              </h3>

              <p className="mt-2 text-sm text-gray-500">{course.institutionName}</p>

              {course.language && (
                <p className="mt-1 text-sm text-gray-500">Language: {course.language}</p>
              )}
            </div>
          ))
        ) : (
          <p className="py-10 text-gray-500">No courses found.</p>
        )}
      </div>
    </Container>
  );
}
