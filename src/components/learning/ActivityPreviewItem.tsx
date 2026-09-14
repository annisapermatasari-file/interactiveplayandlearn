import { Card } from "@/components/ui/Card";
import { ACTIVITY_TYPE_LABELS } from "@/lib/content";
import type { ActivityType } from "@/generated/prisma/client";

export function ActivityPreviewItem({
  activity,
}: {
  activity: { id: string; title: string; type: ActivityType; _count: { questions: number } };
}) {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <p className="font-medium">{activity.title}</p>
        <p className="text-sm text-muted">{ACTIVITY_TYPE_LABELS[activity.type]}</p>
      </div>
      <span className="shrink-0 text-sm text-muted">{activity._count.questions} soal</span>
    </Card>
  );
}
