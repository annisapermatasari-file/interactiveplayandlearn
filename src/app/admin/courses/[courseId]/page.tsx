import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireGlobalAdmin, ForbiddenError } from "@/lib/permissions";
import { getCourseForAdmin } from "@/lib/admin";
import { createModule, updateModule, createLesson, updateCourse } from "@/server/actions/admin";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CourseForm } from "@/components/admin/CourseForm";
import { ModuleForm } from "@/components/admin/ModuleForm";
import { LessonForm } from "@/components/admin/LessonForm";

export default async function AdminCoursePage({ params }: PageProps<"/admin/courses/[courseId]">) {
  const { courseId } = await params;
  const user = await requireUser();
  await requireGlobalAdmin(user.id).catch((error) => {
    if (error instanceof ForbiddenError) notFound();
    throw error;
  });

  const course = await getCourseForAdmin(courseId);
  if (!course) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/admin" className="text-sm text-muted underline">
          ← Semua Kursus
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{course.title}</h1>
          <StatusBadge status={course.status} />
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Detail Kursus</h2>
        <div className="mt-4">
          <CourseForm
            action={updateCourse.bind(null, courseId)}
            submitLabel="Simpan Perubahan"
            defaultValues={{ title: course.title, description: course.description, status: course.status }}
            showStatus
          />
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {course.modules.map((courseModule) => (
          <Card key={courseModule.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{courseModule.title}</h3>
              <StatusBadge status={courseModule.status} />
            </div>
            <ModuleForm
              action={updateModule.bind(null, courseModule.id, courseId)}
              submitLabel="Simpan"
              defaultValues={{ title: courseModule.title, status: courseModule.status }}
              showStatus
            />

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {courseModule.lessons.map((lesson) => (
                <Link key={lesson.id} href={`/admin/courses/${courseId}/lessons/${lesson.id}`}>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary">
                    <div>
                      <p className="font-medium">{lesson.title}</p>
                      <p className="text-sm text-muted">{lesson._count.activities} aktivitas</p>
                    </div>
                    <StatusBadge status={lesson.status} />
                  </div>
                </Link>
              ))}
              {courseModule.lessons.length === 0 ? (
                <p className="text-sm text-muted">Belum ada pelajaran.</p>
              ) : null}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium">Tambah Pelajaran</p>
              <LessonForm action={createLesson.bind(null, courseModule.id, courseId)} submitLabel="Tambah" />
            </div>
          </Card>
        ))}
        {course.modules.length === 0 ? <p className="text-sm text-muted">Belum ada modul.</p> : null}
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Tambah Modul</h2>
        <div className="mt-4">
          <ModuleForm action={createModule.bind(null, courseId)} submitLabel="Tambah Modul" />
        </div>
      </Card>
    </main>
  );
}
