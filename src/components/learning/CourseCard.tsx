import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

// Two-hue rotation only (primary/topic) — DESIGN.md caps the play tier at
// one extra accent hue beyond the shared palette.
const TOPIC_DOT_STYLES = ["bg-primary", "bg-topic"] as const;

export function CourseCard({
  course,
  isEnrolled,
  index = 0,
}: {
  course: { id: string; title: string; description: string | null };
  isEnrolled: boolean;
  index?: number;
}) {
  const dotColor = TOPIC_DOT_STYLES[index % TOPIC_DOT_STYLES.length];

  return (
    <Card className="flex flex-col gap-3 rounded-3xl">
      <div className="flex items-center gap-3">
        <span aria-hidden className={cn("h-3 w-3 shrink-0 rounded-full", dotColor)} />
        <h3 className="text-lg font-semibold">{course.title}</h3>
      </div>
      {course.description ? <p className="text-sm text-muted">{course.description}</p> : null}
      <Link href={`/learn/courses/${course.id}`} className={buttonClasses({ size: "lg", className: "self-start" })}>
        {isEnrolled ? "Lanjutkan Belajar" : "Mulai Belajar"}
      </Link>
    </Card>
  );
}
