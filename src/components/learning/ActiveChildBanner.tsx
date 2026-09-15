import Link from "next/link";

export function ActiveChildBanner({
  child,
}: {
  child: { displayName: string; avatarUrl: string | null };
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-2xl">
          {child.avatarUrl ?? "🙂"}
        </span>
        <span className="text-sm text-muted">
          Belajar sebagai <strong className="text-foreground">{child.displayName}</strong>
        </span>
      </div>
      <Link href="/parent" className="text-sm text-primary underline">
        Ganti
      </Link>
    </div>
  );
}
