import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveChild } from "@/lib/permissions";
import { getPublishedLessonById } from "@/lib/content";
import { getLessonProgress } from "@/lib/progress";
import { ActiveChildBanner } from "@/components/learning/ActiveChildBanner";
import { ActivityPreviewItem } from "@/components/learning/ActivityPreviewItem";
import { LessonProgressBadge } from "@/components/learning/LessonProgressBadge";
import { buttonClasses } from "@/components/ui/Button";

export default async function LessonPage({ params }: PageProps<"/learn/lessons/[lessonId]">) {
  const { lessonId } = await params;
  const { child } = await requireActiveChild();

  const lesson = await getPublishedLessonById(lessonId);
  if (!lesson) notFound();

  const progress = await getLessonProgress(child.id, lesson.id);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <ActiveChildBanner child={child} />

      <div>
        <Link href={`/learn/courses/${lesson.module.course.id}`} className="text-sm text-muted underline">
          ← {lesson.module.course.title}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">{lesson.title}</h1>
          <LessonProgressBadge progress={progress} />
        </div>
        {lesson.description ? <p className="mt-1 text-sm text-muted">{lesson.description}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        {lesson.activities.map((activity) => (
          <ActivityPreviewItem key={activity.id} activity={activity} />
        ))}
      </div>

      <Link href={`/learn/lessons/${lesson.id}/play`} className={buttonClasses({ size: "lg", className: "self-start" })}>
        {progress?.status === "COMPLETED" ? "Ulangi Pelajaran" : "Mulai Belajar"}
      </Link>
    </main>
  );
}
