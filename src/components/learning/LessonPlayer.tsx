"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submitAnswer } from "@/server/actions/learning";
import { calculateScorePercent, calculateStars } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { ActivityAnswerState, ChildSafeQuestion } from "@/types/learning";

export function LessonPlayer({
  lessonId,
  lessonTitle,
  questions,
  backHref,
}: {
  lessonId: string;
  lessonTitle: string;
  questions: ChildSafeQuestion[];
  backHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [answerState, setAnswerState] = useState<ActivityAnswerState>({ status: "unanswered" });
  const [results, setResults] = useState<boolean[]>([]);
  // XP actually credited by the server this playthrough (0 if a question
  // was already answered correctly before — XP only pays out once per
  // question ever, see submitAnswer), and any badges newly awarded.
  const [xpEarned, setXpEarned] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<{ code: string; name: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (questions.length === 0) {
    return (
      <Card>
        <p className="text-sm text-muted">Belum ada soal pada pelajaran ini.</p>
      </Card>
    );
  }

  const isFinished = index >= questions.length;

  if (isFinished) {
    // This playthrough's own results — good for the immediate "how did I
    // just do" summary. The saved LessonProgress (shown on the lesson intro
    // page) is computed server-side from the child's full attempt history
    // across every playthrough, and is the authoritative record.
    const correctCount = results.filter(Boolean).length;
    const scorePercent = calculateScorePercent(correctCount, results.length);
    const stars = calculateStars(scorePercent);

    return (
      <Card className="flex flex-col items-center gap-4 rounded-3xl py-10 text-center">
        <h2 className="text-2xl font-semibold">Pelajaran Selesai! 🎉</h2>
        <p className="celebrate text-5xl" aria-label={`${stars} dari 3 bintang`}>
          {"⭐".repeat(stars)}
          {"☆".repeat(3 - stars)}
        </p>
        <p className="text-lg">
          Skor percobaan ini: <strong>{scorePercent}%</strong> ({correctCount}/{results.length} benar)
        </p>
        <p className="text-muted">+{xpEarned} XP</p>
        {earnedBadges.length > 0 ? (
          <div className="flex flex-col items-center gap-1">
            <p className="text-sm font-medium text-accent-foreground">Lencana baru!</p>
            <p className="text-base">
              {earnedBadges.map((badge) => `🏅 ${badge.name}`).join("  ")}
            </p>
          </div>
        ) : null}
        <Link href={backHref} className={buttonClasses({ className: "mt-2" })}>
          Kembali ke Pelajaran
        </Link>
      </Card>
    );
  }

  const currentQuestion = questions[index];

  function handleSelect(optionId: string) {
    // Both checks matter: answerState guards against re-clicking after a
    // result comes back, isPending guards the window while a submission is
    // still in flight (answerState hasn't changed yet) — without it, a fast
    // double-click could fire two submitAnswer calls for the same question.
    if (answerState.status !== "unanswered" || isPending) return;
    setError(null);
    startTransition(async () => {
      const result = await submitAnswer({
        lessonId,
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setAnswerState({
        status: "answered",
        selectedOptionId: optionId,
        isCorrect: result.isCorrect,
        correctOptionId: result.correctOptionId,
      });
      setResults((prev) => [...prev, result.isCorrect]);
      setXpEarned((prev) => prev + result.xpAwarded);
      if (result.newBadges.length > 0) {
        setEarnedBadges((prev) => [...prev, ...result.newBadges]);
      }
    });
  }

  function handleNext() {
    setAnswerState({ status: "unanswered" });
    setIndex((current) => current + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{lessonTitle}</span>
        <span>
          Soal {index + 1} dari {questions.length}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-in-out)]"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      {/* Keyed by question so the option grid's .reveal entrance replays per question. */}
      <Card key={currentQuestion.id} className="rounded-3xl">
        <ActivityRenderer
          question={currentQuestion}
          answerState={answerState}
          onSelect={handleSelect}
          disabled={isPending}
        />
      </Card>

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}

      {answerState.status === "answered" ? (
        <div className="flex flex-col items-center gap-3">
          <p
            className={cn(
              "text-xl font-semibold",
              answerState.isCorrect ? "celebrate text-success" : "text-danger",
            )}
          >
            {answerState.isCorrect ? "Benar! 🎉" : "Belum tepat, lihat jawaban yang benar."}
          </p>
          <Button onClick={handleNext} size="lg">
            {index + 1 < questions.length ? "Lanjut" : "Selesai"}
          </Button>
        </div>
      ) : (
        <p className="text-center text-sm text-muted">
          {isPending ? "Memeriksa..." : "Pilih salah satu jawaban."}
        </p>
      )}
    </div>
  );
}
