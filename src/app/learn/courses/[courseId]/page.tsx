import Link from "next/link";
import { notFound } from "next/navigation";
import { requireActiveChild } from "@/lib/permissions";
import { getPublishedCourseById } from "@/lib/content";
import { getLessonProgressMap } from "@/lib/progress";
import { ActiveChildBanner } from "@/components/learning/ActiveChildBanner";
import { LessonListItem } from "@/components/learning/LessonListItem";

export default async function CoursePage({ params }: PageProps<"/learn/courses/[courseId]">) {
  const { courseId } = await params;
  const { child } = await requireActiveChild();

  const course = await getPublishedCourseById(courseId);
  if (!course) notFound();

  const lessonIds = course.modules.flatMap((courseModule) => courseModule.lessons.map((lesson) => lesson.id));
  const progressMap = await getLessonProgressMap(child.id, lessonIds);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <ActiveChildBanner child={child} />

      <div>
        <Link href="/learn" className="text-sm text-muted underline">
          ← Semua Kursus
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{course.title}</h1>
        {course.description ? <p className="mt-1 text-sm text-muted">{course.description}</p> : null}
      </div>

      <div className="flex flex-col gap-6">
        {course.modules.map((courseModule) => (
          <div key={courseModule.id} className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">{courseModule.title}</h2>
            <div className="flex flex-col gap-2">
              {courseModule.lessons.map((lesson) => (
                <LessonListItem key={lesson.id} lesson={lesson} progress={progressMap.get(lesson.id)} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
