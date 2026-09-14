import "server-only";
import { db } from "@/lib/db";

export async function getLessonProgress(childId: string, lessonId: string) {
  return db.lessonProgress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  });
}

/** Batch lookup for a course page rendering many lessons at once. */
export async function getLessonProgressMap(childId: string, lessonIds: string[]) {
  if (lessonIds.length === 0) return new Map<string, Awaited<ReturnType<typeof getLessonProgress>>>();

  const rows = await db.lessonProgress.findMany({
    where: { childId, lessonId: { in: lessonIds } },
  });
  return new Map(rows.map((row) => [row.lessonId, row]));
}
