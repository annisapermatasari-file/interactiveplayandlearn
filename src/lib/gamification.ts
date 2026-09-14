import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// Accepts either the top-level PrismaClient or a $transaction callback's
// `tx` — both expose the same model delegates we use here, so badge/streak
// checks can run either standalone or as part of submitAnswer's transaction.
type DbClient = typeof db | Prisma.TransactionClient;

const STREAK_TIMEZONE = "Asia/Jakarta";

function toDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: STREAK_TIMEZONE }).format(date);
}

/**
 * Consecutive calendar days (in STREAK_TIMEZONE) with at least one activity
 * date, counting back from today. If neither today nor yesterday has
 * activity, the streak is broken (0) — a gap further back doesn't matter.
 * Pure function: no DB access, so it's directly testable.
 */
export function calculateCurrentStreak(activityDateStrings: string[], todayDateString: string): number {
  const days = new Set(activityDateStrings);
  if (days.size === 0) return 0;

  const today = new Date(`${todayDateString}T00:00:00Z`);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayString = yesterday.toISOString().slice(0, 10);

  let cursor: Date;
  if (days.has(todayDateString)) {
    cursor = today;
  } else if (days.has(yesterdayString)) {
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

export async function getCurrentStreak(childId: string, client: DbClient = db): Promise<number> {
  const attempts = await client.attempt.findMany({
    where: { childId },
    select: { attemptedAt: true },
  });
  const activityDates = attempts.map((attempt) => toDateString(attempt.attemptedAt));
  return calculateCurrentStreak(activityDates, toDateString(new Date()));
}

type BadgeContext = {
  completedLessonsCount: number;
  hasAnyCorrectAttempt: boolean;
  hasPerfectLesson: boolean;
  hasCompletedCountingFundamentals: boolean;
  currentStreak: number;
};

// Trigger conditions for the badges seeded in prisma/seed.ts. Names are
// PRD examples (§20); these conditions are this project's own reasonable
// reading of them, documented here since the PRD doesn't specify exact
// thresholds.
const BADGE_CHECKS: { code: string; isEarned: (ctx: BadgeContext) => boolean }[] = [
  // "Started learning to count" — first correct answer, before finishing a whole lesson.
  { code: "COUNTING_STARTER", isEarned: (ctx) => ctx.hasAnyCorrectAttempt },
  { code: "FIRST_LESSON", isEarned: (ctx) => ctx.completedLessonsCount >= 1 },
  { code: "FIVE_LESSONS", isEarned: (ctx) => ctx.completedLessonsCount >= 5 },
  { code: "PERFECT_LESSON", isEarned: (ctx) => ctx.hasPerfectLesson },
  { code: "COUNTING_CHAMPION", isEarned: (ctx) => ctx.hasCompletedCountingFundamentals },
  { code: "SEVEN_DAY_STREAK", isEarned: (ctx) => ctx.currentStreak >= 7 },
];

/**
 * Evaluates every badge's condition against the child's current state and
 * awards any newly-earned ones. Safe to call after every attempt: an
 * already-earned badge is silently skipped via ChildBadge's
 * [childId, badgeId] unique constraint (createMany + skipDuplicates), so
 * repeated calls can never double-award. Returns only the badges newly
 * granted by *this* call, for immediate UI feedback.
 */
export async function checkAndAwardBadges(
  childId: string,
  client: DbClient = db,
): Promise<{ code: string; name: string }[]> {
  const [completedLessonsCount, correctAttemptCount, perfectLessonCount, currentStreak, countingCourse] =
    await Promise.all([
      client.lessonProgress.count({ where: { childId, status: "COMPLETED" } }),
      client.attempt.count({ where: { childId, isCorrect: true } }),
      client.lessonProgress.count({ where: { childId, status: "COMPLETED", scorePercent: 100 } }),
      getCurrentStreak(childId, client),
      client.course.findUnique({ where: { slug: "counting-fundamentals" }, select: { id: true } }),
    ]);

  let hasCompletedCountingFundamentals = false;
  if (countingCourse) {
    const [totalLessons, completedInCourse] = await Promise.all([
      client.lesson.count({
        where: { status: "PUBLISHED", module: { status: "PUBLISHED", courseId: countingCourse.id } },
      }),
      client.lessonProgress.count({
        where: {
          childId,
          status: "COMPLETED",
          lesson: { status: "PUBLISHED", module: { status: "PUBLISHED", courseId: countingCourse.id } },
        },
      }),
    ]);
    hasCompletedCountingFundamentals = totalLessons > 0 && completedInCourse >= totalLessons;
  }

  const ctx: BadgeContext = {
    completedLessonsCount,
    hasAnyCorrectAttempt: correctAttemptCount > 0,
    hasPerfectLesson: perfectLessonCount > 0,
    hasCompletedCountingFundamentals,
    currentStreak,
  };

  const earnedCodes = BADGE_CHECKS.filter((check) => check.isEarned(ctx)).map((check) => check.code);
  if (earnedCodes.length === 0) return [];

  const badges = await client.badge.findMany({ where: { code: { in: earnedCodes } } });

  const newlyAwarded: { code: string; name: string }[] = [];
  for (const badge of badges) {
    const result = await client.childBadge.createMany({
      data: [{ childId, badgeId: badge.id }],
      skipDuplicates: true,
    });
    if (result.count > 0) {
      newlyAwarded.push({ code: badge.code, name: badge.name });
    }
  }

  return newlyAwarded;
}
