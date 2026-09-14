// Pure, side-effect-free scoring rules — no DB access here. Phase 5 uses
// these to compute the transient end-of-lesson summary shown to the child
// (nothing is persisted yet). Phase 6 will call these same functions when
// writing the authoritative Attempt/LessonProgress/XPTransaction rows, so
// the rule lives in exactly one place.

export const XP_PER_CORRECT_ANSWER = 10;
export const XP_PER_INCORRECT_ANSWER = 0;

export function calculateXpForAnswer(isCorrect: boolean): number {
  return isCorrect ? XP_PER_CORRECT_ANSWER : XP_PER_INCORRECT_ANSWER;
}

export function calculateScorePercent(correctCount: number, totalCount: number): number {
  if (totalCount <= 0) return 0;
  return Math.round((correctCount / totalCount) * 100);
}

export function calculateStars(scorePercent: number): 1 | 2 | 3 {
  if (scorePercent >= 90) return 3;
  if (scorePercent >= 70) return 2;
  return 1;
}
