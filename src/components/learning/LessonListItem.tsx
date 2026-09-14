import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { LessonProgressBadge } from "@/components/learning/LessonProgressBadge";
import type { LessonProgress } from "@/generated/prisma/client";

export function LessonListItem({
  lesson,
  progress,
}: {
  lesson: { id: string; title: string; description: string | null; _count: { activities: number } };
  progress?: LessonProgress | null;
}) {
  return (
    <Link href={`/learn/lessons/${lesson.id}`}>
      <Card className="flex items-center justify-between gap-3 transition-colors hover:border-primary">
        <div>
          <p className="font-medium">{lesson.title}</p>
          {lesson.description ? <p className="text-sm text-muted">{lesson.description}</p> : null}
        </div>
        {progress ? (
          <LessonProgressBadge progress={progress} />
        ) : (
          <span className="shrink-0 text-sm text-muted">{lesson._count.activities} aktivitas</span>
        )}
      </Card>
    </Link>
  );
}
