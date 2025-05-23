import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getInstitution } from '@/lib/db';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

// Force dynamic rendering to ensure data is fetched at runtime, not build time
export const dynamic = 'force-dynamic';

// Define the type for institution page params
type InstitutionParams = {
  id: string;
};

// Use the Next.js specific page props pattern for Next.js 15
type Props = {
  params: Promise<InstitutionParams>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

// Function to group courses by unique skills
function groupCoursesBySkills(courses: any[]) {
  const skillMap = new Map();

  courses.forEach((course) => {
    if (course.skills) {
      course.skills.forEach((skill: any) => {
        if (!skillMap.has(skill.id)) {
          skillMap.set(skill.id, {
            id: skill.id,
            name: skill.preferred_label,
            courses: [],
          });
        }

        skillMap.get(skill.id).courses.push({
          id: course.id,
          name: course.courseName,
        });
      });
    }
  });

  return Array.from(skillMap.values());
}

export default async function InstitutionPage({ params }: Props) {
  const resolvedParams = await params;
  const institutionId = resolvedParams.id;
  const institution = await getInstitution(institutionId);

  if (!institution) {
    notFound();
  }

  // Extract all unique skills from courses
  let allSkills: any[] = [];
  institution.courses.forEach((course: any) => {
    if (course.skills) {
      allSkills = [...allSkills, ...course.skills];
    }
  });

  // Deduplicate skills
  const uniqueSkills = Array.from(new Set(allSkills.map((skill) => skill.id)))
    .map((id) => allSkills.find((skill) => skill.id === id))
    .filter(Boolean);

  // Group courses by skills
  const skillsWithCourses = groupCoursesBySkills(institution.courses);

  return (
    <Container className="mb-24 mt-16">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            {institution.name}
          </h1>

          <div className="mt-6 text-lg leading-8 text-gray-600">
            <p>
              {institution.description ||
                `${institution.name} is an educational institution providing various learning opportunities across multiple disciplines. 
                 Explore the courses offered by this institution to enhance your skills and knowledge.`}
            </p>
          </div>

          <div className="mt-8">
            <Button href="#" variant="outline" className="w-auto">
              Website
            </Button>
          </div>
        </div>

        <div className="flex items-start justify-center">
          <div className="flex h-36 w-36 items-center justify-center rounded-full bg-gray-200 text-xl font-bold text-gray-500">
            LOGO
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Learning Opportunities</h2>

        <div className="mt-10 space-y-12">
          {institution.courses.length > 0 ? (
            institution.courses.map((course: any) => (
              <div key={course.id} className="border-b border-gray-200 pb-8">
                <h3 className="text-xl font-semibold text-gray-900">
                  <Link href={`/courses/${course.id}`} className="hover:text-indigo-600">
                    {course.courseName}
                  </Link>
                </h3>

                {course.skills && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {course.skills.slice(0, 5).map((skill: any) => (
                        <Link
                          key={skill.id}
                          href={`/skills/${skill.id}`}
                          className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
                        >
                          {skill.preferred_label}
                        </Link>
                      ))}

                      {course.skills.length > 5 && (
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-3 py-1 text-sm font-medium text-gray-500">
                          +{course.skills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500">No courses found for this institution.</p>
          )}
        </div>

        {institution.courses.length > 6 && (
          <div className="mt-10">
            <Button href="#" variant="solid" className="bg-black text-white hover:bg-gray-800">
              Show more
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
}
