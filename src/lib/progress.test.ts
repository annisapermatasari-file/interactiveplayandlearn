import test from "node:test";
import assert from "node:assert/strict";

import { recomputeLessonProgress } from "./progress";

test("recomputeLessonProgress counts unique correct questions and marks lesson complete when all are attempted", async () => {
  const tx = {
    attempt: {
      findMany: async () => [
        { questionId: "q1", isCorrect: true },
        { questionId: "q1", isCorrect: true },
        { questionId: "q2", isCorrect: false },
        { questionId: "q3", isCorrect: true },
      ],
    },
    lessonProgress: {
      findUnique: async () => ({
        stars: 0,
        completedAt: null,
      }),
      upsert: async (args: any) => args.create,
    },
  } as any;

  const result = await recomputeLessonProgress(tx, "child-1", "lesson-1", 3);

  assert.equal(result.questionsCorrect, 2);
  assert.equal(result.scorePercent, 67);
  assert.equal(result.status, "COMPLETED");
  assert.equal(result.stars, 2);
});

test("recomputeLessonProgress leaves lesson in progress when not all questions have been attempted", async () => {
  const tx = {
    attempt: {
      findMany: async () => [
        { questionId: "q1", isCorrect: true },
      ],
    },
    lessonProgress: {
      findUnique: async () => ({
        stars: 0,
        completedAt: null,
      }),
      upsert: async (args: any) => args.create,
    },
  } as any;

  const result = await recomputeLessonProgress(tx, "child-1", "lesson-2", 3);

  assert.equal(result.questionsCorrect, 1);
  assert.equal(result.scorePercent, 33);
  assert.equal(result.status, "IN_PROGRESS");
  assert.equal(result.stars, 0);
});
