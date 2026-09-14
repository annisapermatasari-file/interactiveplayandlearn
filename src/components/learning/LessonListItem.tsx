import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function LessonListItem({
  lesson,
}: {
  lesson: { id: string; title: string; description: string | null; _count: { activities: number } };
}) {
  return (
    <Link href={`/learn/lessons/${lesson.id}`}>
      <Card className="flex items-center justify-between gap-3 transition-colors hover:border-primary">
        <div>
          <p className="font-medium">{lesson.title}</p>
          {lesson.description ? <p className="text-sm text-muted">{lesson.description}</p> : null}
        </div>
        <span className="shrink-0 text-sm text-muted">{lesson._count.activities} aktivitas</span>
      </Card>
    </Link>
  );
}
