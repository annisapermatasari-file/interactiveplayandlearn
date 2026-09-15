import { cn } from "@/lib/utils";
import type { ContentStatus } from "@/generated/prisma/client";

const STATUS_STYLES: Record<ContentStatus, string> = {
  DRAFT: "bg-border text-muted",
  PUBLISHED: "bg-success/15 text-success",
  ARCHIVED: "bg-danger/15 text-danger",
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
  ARCHIVED: "Diarsipkan",
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
