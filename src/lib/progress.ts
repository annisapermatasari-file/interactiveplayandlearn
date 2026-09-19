import "server-only";
import { db } from "@/lib/db";
import { getCurrentStreak } from "@/lib/gamification";
import { calculateScorePercent, calculateStars } from "@/lib/scoring";
import type { Prisma } from "@/generated/prisma/client";

type DbClient = typeof db | Prisma.TransactionClient;

export async function recomputeLessonProgress(
  client: DbClient,
  childId: string,
  lessonId: string,
  lessonQuestionCount: number,
) {
  const attempts = await client.attempt.findMany({
    where: { childId, lessonId },
    select: { questionId: true, isCorrect: true },
  });

  const attemptedQuestionIds = new Set(attempts.map((attempt) => attempt.questionId));
  const correctQuestionIds = new Set(
    attempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.questionId),
  );

  const questionsCorrect = correctQuestionIds.size;
  const scorePercent = calculateScorePercent(questionsCorrect, lessonQuestionCount);
  const isComplete = lessonQuestionCount > 0 && attemptedQuestionIds.size >= lessonQuestionCount;

  const existingProgress = await client.lessonProgress.findUnique({
    where: { childId_lessonId: { childId, lessonId } },
  });

  const stars = isComplete ? calculateStars(scorePercent) : (existingProgress?.stars ?? 0);
  const completedAt = isComplete
    ? (existingProgress?.completedAt ?? new Date())
    : (existingProgress?.completedAt ?? null);

  const progress = await client.lessonProgress.upsert({
    where: { childId_lessonId: { childId, lessonId } },
    update: {
      status: isComplete ? "COMPLETED" : "IN_PROGRESS",
      questionsTotal: lessonQuestionCount,
      questionsCorrect,
      scorePercent,
      stars,
      completedAt,
    },
    create: {
      childId,
      lessonId,
      status: isComplete ? "COMPLETED" : "IN_PROGRESS",
      questionsTotal: lessonQuestionCount,
      questionsCorrect,
      scorePercent,
      stars,
      startedAt: new Date(),
      completedAt,
    },
  });

  return {
    ...progress,
    questionsCorrect,
    scorePercent,
    status: isComplete ? "COMPLETED" : "IN_PROGRESS",
    stars,
  };
}

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

/**
 * Everything the parent dashboard (Phase 8) needs for one child, gathered
 * in one place. Callers are responsible for authorization — this trusts
 * childId, same as the other functions in this file.
 */
export async function getChildDashboardData(childId: string) {
  const [
    xpAggregate,
    totalAttempts,
    correctAttempts,
    lessonProgressRows,
    childBadges,
    skillMastery,
    currentStreak,
    totalPublishedLessons,
    enrollments,
  ] = await Promise.all([
    db.xPTransaction.aggregate({ where: { childId }, _sum: { amount: true } }),
    db.attempt.count({ where: { childId } }),
    db.attempt.count({ where: { childId, isCorrect: true } }),
    db.lessonProgress.findMany({
      where: { childId },
      orderBy: { updatedAt: "desc" },
      include: { lesson: { include: { module: { include: { course: true } } } } },
    }),
    db.childBadge.findMany({
      where: { childId },
      include: { badge: true },
      orderBy: { awardedAt: "desc" },
    }),
    db.skillMastery.findMany({ where: { childId }, orderBy: { masteryScore: "desc" } }),
    getCurrentStreak(childId),
    db.lesson.count({
      where: { status: "PUBLISHED", module: { status: "PUBLISHED", course: { status: "PUBLISHED" } } },
    }),
    db.enrollment.findMany({ where: { childId }, include: { course: true } }),
  ]);

  const totalXp = xpAggregate._sum.amount ?? 0;
  const totalStars = lessonProgressRows.reduce((sum, row) => sum + row.stars, 0);
  const completedLessons = lessonProgressRows.filter((row) => row.status === "COMPLETED");
  const overallProgressPercent =
    totalPublishedLessons > 0 ? Math.round((completedLessons.length / totalPublishedLessons) * 100) : 0;
  const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

  return {
    totalXp,
    totalStars,
    streak: currentStreak,
    badges: childBadges.map((childBadge) => ({
      code: childBadge.badge.code,
      name: childBadge.badge.name,
      description: childBadge.badge.description,
      awardedAt: childBadge.awardedAt,
    })),
    completedLessonsCount: completedLessons.length,
    totalPublishedLessons,
    overallProgressPercent,
    totalAttempts,
    correctAttempts,
    accuracy,
    currentLessonProgress: lessonProgressRows[0] ?? null,
    skillMastery,
    enrollments,
  };
}
