"use client";

import { cn } from "@/lib/utils";
import type { ActivityComponentProps, ChildSafeOption } from "@/types/learning";

// Purely decorative rotation, unanswered state only — swapped for the ✓/✗
// badge the moment an answer is revealed, so it never competes with the
// correctness signal (PRD §33: no interaction may depend on color alone).
const ACCENT_BAR_STYLES = ["bg-primary", "bg-topic", "bg-topic-2", "bg-topic-3"] as const;

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
  const promptLines = question.prompt.split("\n");
  const visualText = promptLines.length > 1 ? promptLines[0] : null;
  const instruction = promptLines.length > 1 ? promptLines.slice(1).join("\n") : question.prompt;
  const sequenceValues = visualText?.startsWith("URUTAN:")
    ? visualText.slice("URUTAN:".length).split(",")
    : null;

  return (
    <div className="flex flex-col items-center gap-8">
      {question.imageUrl || visualText ? (
        <div className="question-visual flex min-h-36 w-full items-center justify-center rounded-3xl border-2 border-accent/60 bg-accent/10 p-5 text-center">
          {sequenceValues ? (
            <div className="sequence-track" aria-label="Urutan angka">
              {sequenceValues.map((value, index) => (
                <span
                  key={`${value}-${index}`}
                  className={cn("sequence-number", value === "_" && "sequence-number-missing")}
                >
                  {value === "_" ? "?" : value}
                </span>
              ))}
            </div>
          ) : question.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={question.imageUrl} alt="Ilustrasi soal" className="max-h-44 rounded-2xl object-contain" />
          ) : (
            <span className="question-emoji text-6xl leading-none" aria-hidden>
              {visualText}
            </span>
          )}
        </div>
      ) : null}
      <p className="whitespace-pre-line text-center text-2xl font-semibold leading-relaxed sm:text-3xl">
        {instruction}
      </p>
      <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
        {options.map((option, i) => {
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
              style={{ transitionDelay: `${i * 60}ms` }}
              className={cn(
                "reveal answer-option-transition relative flex h-28 items-center justify-center overflow-hidden rounded-3xl border-2 text-2xl font-semibold",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                !locked && "hover-scale border-border bg-surface hover:border-primary/50",
                locked && !answered && "border-border bg-surface opacity-70",
                answered && !isRevealedCorrect && !isWrongSelection && "border-border bg-surface opacity-40",
                isRevealedCorrect && "celebrate border-success bg-success/10",
                isWrongSelection && "shake border-danger bg-danger/10",
              )}
            >
              {!locked ? (
                <span
                  aria-hidden
                  className={cn("absolute inset-x-0 top-0 h-1.5", ACCENT_BAR_STYLES[i % ACCENT_BAR_STYLES.length])}
                />
              ) : null}
              {option.label}
              {isRevealedCorrect ? (
                <span
                  aria-hidden
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-success text-base text-white"
                >
                  ✓
                </span>
              ) : null}
              {isWrongSelection ? (
                <span
                  aria-hidden
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-danger text-base text-white"
                >
                  ✗
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
