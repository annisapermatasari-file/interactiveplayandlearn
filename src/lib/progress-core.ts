import { calculateScorePercent, calculateStars } from "@/lib/scoring";
import type { Prisma } from "@/generated/prisma/client";

type ProgressClient = Pick<Prisma.TransactionClient, "attempt" | "lessonProgress">;

export async function recomputeLessonProgress(
  client: ProgressClient,
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
