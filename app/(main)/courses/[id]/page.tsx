import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourse, getRelatedJobProfiles } from '@/lib/db';
import { Layout } from '@/components/Layout';
import { Container } from '@/components/Container';
import { Button } from '@/components/Button';

interface CoursePageProps {
  params: {
    id: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const courseId = params.id;
  const course = await getCourse(courseId);

  if (!course) {
    notFound();
  }

  // Get job profiles related to the skills in this course
  const skillIds = course.skills.map((skill: any) => skill.id);
  const jobProfiles = await getRelatedJobProfiles(skillIds);

  return (
    <Layout>
      <Container className="mt-16 mb-24">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {course.courseName}
        </h1>

        <div className="mt-6 text-lg leading-8 text-gray-600">
          <p>
            {course.description ||
              'This course is part of our education catalog. Learn more about the specific skills and knowledge you can gain by enrolling.'}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-4 text-base sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <h3 className="font-semibold text-gray-900">Provider</h3>
            <p>{course.provider || 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Institution</h3>
            <Link
              href={`/institutions/${course.institution_id}`}
              className="text-indigo-600 hover:text-indigo-500"
            >
              {course.institutionName}
            </Link>
          </div>
          {course.language && (
            <div>
              <h3 className="font-semibold text-gray-900">Language</h3>
              <p>{course.language}</p>
            </div>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Taught skills</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {course.skills.map((skill: any) => (
              <Link
                key={skill.id}
                href={`/skills/${skill.id}`}
                className="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
              >
                {skill.preferred_label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <Button href="#" variant="outline" className="w-auto">
            Website
          </Button>
        </div>

        <div className="mt-20">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Job profiles</h2>
          <p className="mt-4 text-base text-gray-600">
            The skills learned from this course are applicable to the below job profiles.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {jobProfiles.map((job: any) => (
              <div key={job.id} className="group relative bg-gray-100 p-5 rounded-lg">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900">
                  <Link href={`/job-profiles/${job.id}`} className="hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Related skills:</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {job.skills.map((skillId: string) => {
                      const skill = course.skills.find((s: any) => s.id === skillId);
                      return skill ? (
                        <span
                          key={skill.id}
                          className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600"
                        >
                          {skill.preferred_label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Button href="#" variant="filled" className="bg-black text-white hover:bg-gray-800">
              Show more
            </Button>
          </div>
        </div>
      </Container>
    </Layout>
  );
}
