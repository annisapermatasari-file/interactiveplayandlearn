import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireGlobalAdmin, ForbiddenError } from "@/lib/permissions";
import { getLessonForAdmin } from "@/lib/admin";
import { updateLesson, createActivity, updateActivity, createQuestion } from "@/server/actions/admin";
import { ACTIVITY_TYPE_LABELS } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { LessonForm } from "@/components/admin/LessonForm";
import { ActivityForm } from "@/components/admin/ActivityForm";
import { QuestionForm } from "@/components/admin/QuestionForm";

export default async function AdminLessonPage({
  params,
}: PageProps<"/admin/courses/[courseId]/lessons/[lessonId]">) {
  const { courseId, lessonId } = await params;
  const user = await requireUser();
  await requireGlobalAdmin(user.id).catch((error) => {
    if (error instanceof ForbiddenError) notFound();
    throw error;
  });

  const lesson = await getLessonForAdmin(lessonId);
  if (!lesson || lesson.module.courseId !== courseId) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href={`/admin/courses/${courseId}`} className="text-sm text-muted underline">
          ← {lesson.module.course.title}
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <StatusBadge status={lesson.status} />
        </div>
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Detail Pelajaran</h2>
        <div className="mt-4">
          <LessonForm
            action={updateLesson.bind(null, lessonId, courseId)}
            submitLabel="Simpan Perubahan"
            defaultValues={{ title: lesson.title, description: lesson.description, status: lesson.status }}
            showStatus
          />
        </div>
      </Card>

      <div className="flex flex-col gap-6">
        {lesson.activities.map((activity) => (
          <Card key={activity.id} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{activity.title}</h3>
                <p className="text-sm text-muted">{ACTIVITY_TYPE_LABELS[activity.type]}</p>
              </div>
              <StatusBadge status={activity.status} />
            </div>
            <ActivityForm
              action={updateActivity.bind(null, activity.id, courseId, lessonId)}
              submitLabel="Simpan"
              defaultValues={{ title: activity.title, difficulty: activity.difficulty, status: activity.status }}
              showStatus
            />

            <div className="flex flex-col gap-2 border-t border-border pt-4">
              <p className="text-sm font-medium">Soal ({activity.questions.length})</p>
              {activity.questions.map((question) => (
                <Link key={question.id} href={`/admin/questions/${question.id}`}>
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary">
                    <p className="whitespace-pre-line text-sm">{question.prompt}</p>
                    <StatusBadge status={question.status} />
                  </div>
                </Link>
              ))}
              {activity.questions.length === 0 ? (
                <p className="text-sm text-muted">Belum ada soal.</p>
              ) : null}
            </div>

            <div className="border-t border-border pt-4">
              <p className="mb-2 text-sm font-medium">Tambah Soal</p>
              <QuestionForm
                action={createQuestion.bind(null, activity.id, courseId, lessonId)}
                submitLabel="Tambah Soal"
              />
            </div>
          </Card>
        ))}
        {lesson.activities.length === 0 ? <p className="text-sm text-muted">Belum ada aktivitas.</p> : null}
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Tambah Aktivitas</h2>
        <div className="mt-4">
          <ActivityForm
            action={createActivity.bind(null, lessonId, courseId)}
            submitLabel="Tambah Aktivitas"
            showType
          />
        </div>
      </Card>
    </main>
  );
}
