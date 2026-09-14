import { notFound } from "next/navigation";
import { requireActiveChild } from "@/lib/permissions";
import { getLessonQuestionsForPlay } from "@/lib/content";
import { ActiveChildBanner } from "@/components/learning/ActiveChildBanner";
import { LessonPlayer } from "@/components/learning/LessonPlayer";
import type { ChildSafeOption } from "@/types/learning";

export default async function LessonPlayPage({ params }: PageProps<"/learn/lessons/[lessonId]/play">) {
  const { lessonId } = await params;
  const { child } = await requireActiveChild();

  const lesson = await getLessonQuestionsForPlay(lessonId);
  if (!lesson) notFound();

  const questions = lesson.activities.flatMap((activity) =>
    activity.questions.map((question) => ({
      ...question,
      options: question.options as ChildSafeOption[] | null,
      lessonId: lesson.id,
      activityId: activity.id,
      activityType: activity.type,
    })),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <ActiveChildBanner child={child} />
      <LessonPlayer
        lessonId={lesson.id}
        lessonTitle={lesson.title}
        questions={questions}
        backHref={`/learn/lessons/${lesson.id}`}
      />
    </main>
  );
}
