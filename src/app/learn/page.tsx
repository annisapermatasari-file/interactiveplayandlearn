import { requireActiveChild } from "@/lib/permissions";
import { listPublishedCourses, getEnrollment } from "@/lib/content";
import { ActiveChildBanner } from "@/components/learning/ActiveChildBanner";
import { CourseCard } from "@/components/learning/CourseCard";

export default async function LearnPage() {
  // Redirects to /parent if no active child is selected (Phase 3).
  const { child } = await requireActiveChild();
  const courses = await listPublishedCourses();
  const enrollments = await Promise.all(
    courses.map((course) => getEnrollment(child.id, course.id)),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <ActiveChildBanner child={child} />

      <div>
        <h1 className="text-2xl font-semibold">Belajar</h1>
        <p className="mt-1 text-sm text-muted">Pilih kursus untuk memulai.</p>
      </div>

      {courses.length === 0 ? (
        <p className="text-sm text-muted">Belum ada kursus yang tersedia.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {courses.map((course, index) => (
            <CourseCard key={course.id} course={course} isEnrolled={Boolean(enrollments[index])} />
          ))}
        </div>
      )}
    </main>
  );
}
