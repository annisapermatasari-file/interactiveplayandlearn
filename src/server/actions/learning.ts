"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getActiveChild } from "@/lib/permissions";

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
 * this function is the only source of truth for whether an answer is right.
 *
 * This does not yet persist an Attempt, update LessonProgress/SkillMastery,
 * or award XP — those are Phase 6 (Learning Data) and Phase 7
 * (Gamification), which will wrap this same correctness check in a
 * transaction rather than replace it.
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
    select: { correctAnswer: true },
  });
  if (!question) {
    return { ok: false, error: "Soal tidak ditemukan." };
  }

  const correctAnswer = question.correctAnswer as { optionId: string };
  const isCorrect = correctAnswer.optionId === parsed.data.selectedOptionId;

  return { ok: true, isCorrect, correctOptionId: correctAnswer.optionId };
}
