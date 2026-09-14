import type { LessonProgress } from "@/generated/prisma/client";

export function LessonProgressBadge({ progress }: { progress: LessonProgress | null | undefined }) {
  if (!progress || progress.status === "NOT_STARTED") return null;

  if (progress.status === "COMPLETED") {
    return (
      <span className="shrink-0 text-sm text-success">
        {"⭐".repeat(progress.stars)}
        {"☆".repeat(3 - progress.stars)} Selesai
      </span>
    );
  }

  return <span className="shrink-0 text-sm text-muted">Sedang berlangsung · {progress.scorePercent}%</span>;
}
