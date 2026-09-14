import type { ActivityType, Skill } from "@/generated/prisma/client";

export type ChildSafeOption = { id: string; label: string };

/** A question shaped for the child-facing player — never carries correctAnswer. */
export type ChildSafeQuestion = {
  id: string;
  prompt: string;
  imageUrl: string | null;
  audioUrl: string | null;
  options: ChildSafeOption[] | null;
  skill: Skill;
  lessonId: string;
  activityId: string;
  activityType: ActivityType;
};

export type ActivityAnswerState =
  | { status: "unanswered" }
  | { status: "answered"; selectedOptionId: string; isCorrect: boolean; correctOptionId: string };

export type ActivityComponentProps = {
  question: ChildSafeQuestion;
  answerState: ActivityAnswerState;
  onSelect: (optionId: string) => void;
  /** True while a submission is in flight — locks options even though answerState hasn't updated yet. */
  disabled?: boolean;
};
