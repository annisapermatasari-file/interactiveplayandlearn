import { SKILL_LABELS } from "@/lib/content";
import type { Skill } from "@/generated/prisma/client";

export type Recommendation = { id: string; message: string };

type RecommendationInput = {
  totalAttempts: number;
  currentStreak: number;
  weakestSkill: { skill: Skill; masteryScore: number } | null;
  isCourseFullyCompleted: boolean;
};

/**
 * Rule-based only (PRD §18: "Recommendations in MVP can be rule-based. Do
 * not build AI recommendations yet."). Pure function — no DB access — so
 * the rules themselves are directly testable independent of what query
 * feeds them. Ordered roughly by urgency; the caller decides how many to
 * show.
 */
export function getRecommendations(input: RecommendationInput): Recommendation[] {
  if (input.totalAttempts === 0) {
    return [
      {
        id: "get-started",
        message: "Ajak anak memulai pelajaran pertama di Counting Fundamentals.",
      },
    ];
  }

  const recommendations: Recommendation[] = [];

  if (input.weakestSkill && input.weakestSkill.masteryScore < 0.7) {
    const label = SKILL_LABELS[input.weakestSkill.skill] ?? input.weakestSkill.skill;
    recommendations.push({
      id: "practice-weak-skill",
      message: `Latih kembali ${label} untuk meningkatkan kemampuan.`,
    });
  }

  if (input.currentStreak === 0) {
    recommendations.push({
      id: "resume-streak",
      message: "Ajak anak belajar lagi hari ini untuk menjaga semangat belajar.",
    });
  }

  if (input.isCourseFullyCompleted) {
    recommendations.push({
      id: "course-complete",
      message: "Selamat! Semua pelajaran Counting Fundamentals telah selesai.",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "keep-going",
      message: "Anak sedang belajar dengan baik. Lanjutkan latihan secara rutin.",
    });
  }

  return recommendations;
}
