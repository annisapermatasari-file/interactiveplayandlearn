"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { submitAnswer } from "@/server/actions/learning";
import { calculateScorePercent, calculateStars, calculateXpForAnswer } from "@/lib/scoring";
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
    const correctCount = results.filter(Boolean).length;
    const scorePercent = calculateScorePercent(correctCount, results.length);
    const stars = calculateStars(scorePercent);
    // Transient session summary only — nothing here is persisted yet.
    // Phase 6 writes the authoritative Attempt/LessonProgress/XP rows using
    // these same scoring functions.
    const xpEarned = results.reduce((sum, isCorrect) => sum + calculateXpForAnswer(isCorrect), 0);

    return (
      <Card className="flex flex-col items-center gap-4 py-10 text-center">
        <h2 className="text-2xl font-semibold">Pelajaran Selesai! 🎉</h2>
        <p className="text-4xl" aria-label={`${stars} dari 3 bintang`}>
          {"⭐".repeat(stars)}
          {"☆".repeat(3 - stars)}
        </p>
        <p className="text-lg">
          Skor: <strong>{scorePercent}%</strong> ({correctCount}/{results.length} benar)
        </p>
        <p className="text-muted">+{xpEarned} XP</p>
        <Link href={backHref} className={buttonClasses({ className: "mt-2" })}>
          Kembali ke Pelajaran
        </Link>
      </Card>
    );
  }

  const currentQuestion = questions[index];

  function handleSelect(optionId: string) {
    if (answerState.status !== "unanswered") return;
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
      <div className="h-2 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <Card>
        <ActivityRenderer question={currentQuestion} answerState={answerState} onSelect={handleSelect} />
      </Card>

      {error ? <p className="text-center text-sm text-danger">{error}</p> : null}

      {answerState.status === "answered" ? (
        <div className="flex flex-col items-center gap-3">
          <p
            className={
              answerState.isCorrect ? "text-lg font-medium text-success" : "text-lg font-medium text-danger"
            }
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
