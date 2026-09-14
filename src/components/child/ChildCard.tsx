import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { AGE_BAND_LABELS } from "@/lib/childOptions";

export function ChildCard({
  child,
  isActive,
  href,
}: {
  child: { id: string; displayName: string; avatarUrl: string | null; ageBand: string | null };
  isActive?: boolean;
  href?: string;
}) {
  return (
    <Card className={cn("flex items-center gap-4", isActive && "border-primary")}>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/20 text-3xl">
        {child.avatarUrl ?? "🙂"}
      </div>
      <div className="flex-1">
        <p className="font-medium">{child.displayName}</p>
        {child.ageBand ? (
          <p className="text-sm text-muted">{AGE_BAND_LABELS[child.ageBand]}</p>
        ) : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm text-primary underline">
          Kelola
        </Link>
      ) : null}
    </Card>
  );
}
