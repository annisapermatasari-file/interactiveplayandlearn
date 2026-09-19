"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getActiveChild } from "@/lib/permissions";
import { calculateXpForAnswer } from "@/lib/scoring";
import { checkAndAwardBadges } from "@/lib/gamification";
import { recomputeLessonProgress } from "@/lib/progress";

const submitAnswerSchema = z.object({
  lessonId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
});

export type SubmitAnswerResult =
  | {
      ok: true;
      isCorrect: boolean;
      correctOptionId: string;
      xpAwarded: number;
      newBadges: { code: string; name: string }[];
    }
  | { ok: false; error: string };

/**
 * The authoritative per-question check (PRD §14): authenticate, resolve the
 * active child, verify the question actually belongs to the given lesson
 * and is published, load the correct answer from the database, and compute
 * correctness server-side. isCorrect/score/XP are never accepted as input —
 * this function is the only source of truth for whether an answer is right,
 * and for what gets written to the child's learning record.
 *
 * Persists, all in one transaction:
 *  - Attempt (Phase 6): one row per submission, an honest log — replaying a
 *    lesson creates more Attempt rows on purpose.
 *  - LessonProgress (Phase 6): recomputed from *all* of this child's
 *    Attempts for the lesson (distinct questions ever answered / ever
 *    answered correctly), not incremented per call — safe against a
 *    duplicate network retry creating an extra Attempt row.
 *  - SkillMastery (Phase 6): rolling accuracy across every attempt for the
 *    question's skill (PRD §19) — intentionally cumulative.
 *  - XPTransaction (Phase 7): +10 XP on a correct answer, but only the
 *    FIRST time this exact question is ever answered correctly by this
 *    child. XPTransaction's unique [childId, sourceType, sourceId] index
 *    (sourceId = questionId) enforces that — createMany+skipDuplicates
 *    either inserts it or silently no-ops, so retries/replays can never
 *    pay out twice for the same question. Attempt.pointsAwarded records
 *    what THIS attempt was worth for the log; xpAwarded below is what was
 *    actually, newly credited.
 *  - ChildBadge (Phase 7): checkAndAwardBadges re-evaluates every badge
 *    condition against the child's now-updated state and awards any newly
 *    met ones, itself idempotent via ChildBadge's unique constraint.
 */
export async function submitAnswer(input: unknown): Promise<SubmitAnswerResult> {
  const parsed = submitAnswerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Data tidak valid." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sesi berakhir. Silakan masuk kembali." };
  }

  const child = await getActiveChild(session.user.id);
  if (!child) {
    return { ok: false, error: "Pilih profil anak terlebih dahulu." };
  }

  const question = await db.question.findFirst({
    where: {
      id: parsed.data.questionId,
      status: "PUBLISHED",
      activity: {
        lessonId: parsed.data.lessonId,
        status: "PUBLISHED",
      },
    },
    select: { id: true, activityId: true, skill: true, correctAnswer: true },
  });
  if (!question) {
    return { ok: false, error: "Soal tidak ditemukan." };
  }

  const correctAnswer = question.correctAnswer as { optionId: string };
  const isCorrect = correctAnswer.optionId === parsed.data.selectedOptionId;
  const pointsAwarded = calculateXpForAnswer(isCorrect);

  // Fixed size of the lesson, independent of how many attempts each
  // question has accumulated — needed to know when every question has been
  // attempted at least once (lesson complete) versus still in progress.
  const lessonQuestionCount = await db.question.count({
    where: { status: "PUBLISHED", activity: { lessonId: parsed.data.lessonId, status: "PUBLISHED" } },
  });

  const { xpAwarded, newBadges } = await db.$transaction(async (tx) => {
    await tx.attempt.create({
      data: {
        childId: child.id,
        questionId: question.id,
        activityId: question.activityId,
        lessonId: parsed.data.lessonId,
        isCorrect,
        pointsAwarded,
        responseData: { selectedOptionId: parsed.data.selectedOptionId },
      },
    });

    const existingMastery = await tx.skillMastery.findUnique({
      where: { childId_skill: { childId: child.id, skill: question.skill } },
    });
    const attemptsTotal = (existingMastery?.attemptsTotal ?? 0) + 1;
    const attemptsCorrect = (existingMastery?.attemptsCorrect ?? 0) + (isCorrect ? 1 : 0);
    await tx.skillMastery.upsert({
      where: { childId_skill: { childId: child.id, skill: question.skill } },
      update: {
        attemptsTotal,
        attemptsCorrect,
        masteryScore: attemptsCorrect / attemptsTotal,
        lastPracticedAt: new Date(),
      },
      create: {
        childId: child.id,
        skill: question.skill,
        attemptsTotal: 1,
        attemptsCorrect: isCorrect ? 1 : 0,
        masteryScore: isCorrect ? 1 : 0,
      },
    });

    await recomputeLessonProgress(tx, child.id, parsed.data.lessonId, lessonQuestionCount);

    let xpAwardedThisCall = 0;
    if (isCorrect) {
      const xpResult = await tx.xPTransaction.createMany({
        data: [
          {
            childId: child.id,
            amount: pointsAwarded,
            sourceType: "QUESTION_CORRECT",
            sourceId: question.id,
          },
        ],
        skipDuplicates: true,
      });
      xpAwardedThisCall = xpResult.count > 0 ? pointsAwarded : 0;
    }

    const newlyAwardedBadges = await checkAndAwardBadges(child.id, tx);

    return { xpAwarded: xpAwardedThisCall, newBadges: newlyAwardedBadges };
  });

  return { ok: true, isCorrect, correctOptionId: correctAnswer.optionId, xpAwarded, newBadges };
}
