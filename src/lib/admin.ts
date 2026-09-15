import "server-only";
import { db } from "@/lib/db";

// Unlike src/lib/content.ts, these queries are NOT filtered to PUBLISHED —
// admins need to see and edit DRAFT/ARCHIVED content — and getQuestionForAdmin
// is the one place in the codebase that ever reads Question.correctAnswer for
// display. Every function here must only ever be called after the caller has
// verified requireGlobalAdmin(userId); none of them check authorization
// themselves.

export async function listAllCourses() {
  return db.course.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { modules: true } } },
  });
}

export async function getCourseForAdmin(courseId: string) {
  return db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
            include: { _count: { select: { activities: true } } },
          },
        },
      },
    },
  });
}

export async function getLessonForAdmin(lessonId: string) {
  return db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: { include: { course: true } },
      activities: {
        orderBy: { position: "asc" },
        include: { questions: { orderBy: { position: "asc" } } },
      },
    },
  });
}

export async function getQuestionForAdmin(questionId: string) {
  return db.question.findUnique({
    where: { id: questionId },
    include: { activity: { include: { lesson: { include: { module: true } } } } },
  });
}
