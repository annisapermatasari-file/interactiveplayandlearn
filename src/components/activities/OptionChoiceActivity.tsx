"use client";

import { cn } from "@/lib/utils";
import type { ActivityComponentProps, ChildSafeOption } from "@/types/learning";

/**
 * Shared "pick one of N labeled options" renderer. COUNT_SELECT,
 * MULTIPLE_CHOICE, and NUMBER_RECOGNITION all share this exact data shape
 * and interaction (see prisma/seed.ts) — the per-type wrapper components
 * exist so each can diverge later (e.g. audio for number recognition)
 * without duplicating this logic today.
 */
export function OptionChoiceActivity({ question, answerState, onSelect, disabled }: ActivityComponentProps) {
  const options = (question.options as ChildSafeOption[] | null) ?? [];
  const answered = answerState.status === "answered";
  const locked = answered || Boolean(disabled);

  return (
    <div className="flex flex-col items-center gap-8">
      <p className="whitespace-pre-line text-center text-3xl font-semibold leading-relaxed">
        {question.prompt}
      </p>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
        {options.map((option) => {
          const isRevealedCorrect = answered && option.id === answerState.correctOptionId;
          const isWrongSelection =
            answered && option.id === answerState.selectedOptionId && !answerState.isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              disabled={locked}
              aria-label={option.label}
              onClick={() => onSelect(option.id)}
              className={cn(
                "flex h-24 items-center justify-center rounded-2xl border-2 text-2xl font-semibold transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                !locked && "border-border bg-surface hover:border-primary/50",
                locked && !answered && "border-border bg-surface opacity-70",
                answered && !isRevealedCorrect && !isWrongSelection && "border-border bg-surface opacity-40",
                isRevealedCorrect && "border-success bg-success/10",
                isWrongSelection && "border-danger bg-danger/10",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
