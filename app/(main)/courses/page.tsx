import Link from 'next/link';
import { getAllCourses } from '@/lib/db';
import { Container } from '@/components/Container';

export default async function CoursesPage() {
  const coursesResult = await getAllCourses(100, 0);
  const courses = Array.isArray(coursesResult) ? coursesResult : [];

  return (
    <Container className="mb-24 mt-16">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Courses</h1>

      <p className="mt-6 text-lg leading-8 text-gray-600">
        Browse our catalog of courses to find learning opportunities that match your interests and
        career goals.
      </p>

      <div className="mt-10 space-y-12 divide-y divide-gray-200">
        {courses.length > 0 ? (
          courses.map((course: any) => (
            <div key={course.id} className="pb-8 pt-10">
              <h3 className="text-xl font-semibold text-gray-900">
                <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                  {course.courseName}
                </Link>
              </h3>

              <p className="mt-2 text-sm text-gray-500">{course.institutionName}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-gray-500">No courses found.</p>
        )}
      </div>
    </Container>
  );
}
