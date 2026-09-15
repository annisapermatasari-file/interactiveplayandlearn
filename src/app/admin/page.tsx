import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireGlobalAdmin, ForbiddenError } from "@/lib/permissions";
import { listAllCourses } from "@/lib/admin";
import { createCourse } from "@/server/actions/admin";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CourseForm } from "@/components/admin/CourseForm";

export default async function AdminDashboardPage() {
  const user = await requireUser();
  await requireGlobalAdmin(user.id).catch((error) => {
    if (error instanceof ForbiddenError) notFound();
    throw error;
  });

  const courses = await listAllCourses();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">Admin · Kursus</h1>
        <p className="mt-1 text-sm text-muted">Kelola kursus, modul, pelajaran, aktivitas, dan soal.</p>
      </div>

      <div className="flex flex-col gap-3">
        {courses.map((course) => (
          <Link key={course.id} href={`/admin/courses/${course.id}`}>
            <Card className="flex items-center justify-between gap-3 transition-colors hover:border-primary">
              <div>
                <p className="font-medium">{course.title}</p>
                <p className="text-sm text-muted">{course._count.modules} modul</p>
              </div>
              <StatusBadge status={course.status} />
            </Card>
          </Link>
        ))}
        {courses.length === 0 ? <p className="text-sm text-muted">Belum ada kursus.</p> : null}
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Tambah Kursus</h2>
        <div className="mt-4">
          <CourseForm action={createCourse} submitLabel="Buat Kursus" />
        </div>
      </Card>
    </main>
  );
}
