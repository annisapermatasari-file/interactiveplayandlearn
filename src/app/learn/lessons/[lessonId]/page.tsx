import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveChild } from "@/lib/permissions";
import { getPublishedLessonById } from "@/lib/content";
import { ActiveChildBanner } from "@/components/learning/ActiveChildBanner";
import { ActivityPreviewItem } from "@/components/learning/ActivityPreviewItem";
import { Card } from "@/components/ui/Card";

export default async function LessonPage({ params }: PageProps<"/learn/lessons/[lessonId]">) {
  const { lessonId } = await params;
  const { child } = await requireActiveChild();

  const lesson = await getPublishedLessonById(lessonId);
  if (!lesson) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <ActiveChildBanner child={child} />

      <div>
        <Link href={`/learn/courses/${lesson.module.course.id}`} className="text-sm text-muted underline">
          ← {lesson.module.course.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{lesson.title}</h1>
        {lesson.description ? <p className="mt-1 text-sm text-muted">{lesson.description}</p> : null}
      </div>

      <div className="flex flex-col gap-2">
        {lesson.activities.map((activity) => (
          <ActivityPreviewItem key={activity.id} activity={activity} />
        ))}
      </div>

      <Card className="text-sm text-muted">
        Aktivitas interaktif akan tersedia pada fase berikutnya.
      </Card>
    </main>
  );
}
