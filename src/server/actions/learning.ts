"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getActiveChild } from "@/lib/permissions";
import { calculateScorePercent, calculateStars, calculateXpForAnswer } from "@/lib/scoring";

const submitAnswerSchema = z.object({
  lessonId: z.string().min(1),
  questionId: z.string().min(1),
  selectedOptionId: z.string().min(1),
});

export type SubmitAnswerResult =
  | { ok: true; isCorrect: boolean; correctOptionId: string }
  | { ok: false; error: string };

/**
 * The authoritative per-question check (PRD §14): authenticate, resolve the
 * active child, verify the question actually belongs to the given lesson
 * and is published, load the correct answer from the database, and compute
 * correctness server-side. isCorrect/score/XP are never accepted as input —
 * this function is the only source of truth for whether an answer is right,
 * and for what gets written to the child's learning record.
 *
 * Persists (Phase 6 — Learning Data):
 *  - Attempt: one row per submission, an honest log — replaying a lesson
 *    creates more Attempt rows on purpose.
 *  - LessonProgress: recomputed from *all* of this child's Attempts for the
 *    lesson (distinct questions ever answered / ever answered correctly),
 *    not incremented per call. That makes it safe against a duplicate
 *    network retry creating an extra Attempt row: recomputing from the
 *    same underlying set of distinct-correct questions yields the same
 *    result, so a duplicate attempt cannot inflate the score.
 *  - SkillMastery: rolling accuracy across every attempt for the question's
 *    skill (PRD §19: mastery = correctAttempts / totalAttempts) — this one
 *    is intentionally cumulative, since more practice attempts are exactly
 *    what should move it.
 *
 * XP is deliberately NOT awarded here — XPTransaction is a Gamification
 * (Phase 7) concern with its own idempotency constraint. Attempt.pointsAwarded
 * below just records what an attempt was worth, not a ledger credit.
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

  await db.$transaction(async (tx) => {
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

    const lessonAttempts = await tx.attempt.findMany({
      where: { childId: child.id, lessonId: parsed.data.lessonId },
      select: { questionId: true, isCorrect: true },
    });
    const attemptedQuestionIds = new Set(lessonAttempts.map((attempt) => attempt.questionId));
    const correctQuestionIds = new Set(
      lessonAttempts.filter((attempt) => attempt.isCorrect).map((attempt) => attempt.questionId),
    );
    const questionsCorrect = correctQuestionIds.size;
    const scorePercent = calculateScorePercent(questionsCorrect, lessonQuestionCount);
    const isNowComplete = lessonQuestionCount > 0 && attemptedQuestionIds.size >= lessonQuestionCount;

    const existingProgress = await tx.lessonProgress.findUnique({
      where: { childId_lessonId: { childId: child.id, lessonId: parsed.data.lessonId } },
    });

    await tx.lessonProgress.upsert({
      where: { childId_lessonId: { childId: child.id, lessonId: parsed.data.lessonId } },
      update: {
        status: isNowComplete ? "COMPLETED" : "IN_PROGRESS",
        questionsTotal: lessonQuestionCount,
        questionsCorrect,
        scorePercent,
        stars: isNowComplete ? calculateStars(scorePercent) : (existingProgress?.stars ?? 0),
        completedAt: isNowComplete ? (existingProgress?.completedAt ?? new Date()) : (existingProgress?.completedAt ?? null),
      },
      create: {
        childId: child.id,
        lessonId: parsed.data.lessonId,
        status: isNowComplete ? "COMPLETED" : "IN_PROGRESS",
        questionsTotal: lessonQuestionCount,
        questionsCorrect,
        scorePercent,
        stars: isNowComplete ? calculateStars(scorePercent) : 0,
        startedAt: new Date(),
        completedAt: isNowComplete ? new Date() : null,
      },
    });
  });

  return { ok: true, isCorrect, correctOptionId: correctAnswer.optionId };
}
