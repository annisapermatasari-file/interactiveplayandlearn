import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";

export function CourseCard({
  course,
  isEnrolled,
}: {
  course: { id: string; title: string; description: string | null };
  isEnrolled: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold">{course.title}</h3>
        {course.description ? <p className="mt-1 text-sm text-muted">{course.description}</p> : null}
      </div>
      <Link href={`/learn/courses/${course.id}`} className={buttonClasses({ size: "sm", className: "self-start" })}>
        {isEnrolled ? "Lanjutkan Belajar" : "Mulai Belajar"}
      </Link>
    </Card>
  );
}
