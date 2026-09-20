"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ActivityRenderer } from "@/components/activities/ActivityRenderer";
import { LearningBuddy } from "@/components/learning/LearningBuddy";
import { GameHud } from "@/components/learning/GameHud";
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
  const [streak, setStreak] = useState(0);
  // XP actually credited by the server this playthrough (0 if a question
  // was already answered correctly before — XP only pays out once per
  // question ever, see submitAnswer), and any badges newly awarded.
  const [xpEarned, setXpEarned] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<{ code: string; name: string }[]>([]);
  const [buddyState, setBuddyState] = useState<"ready" | "thinking" | "correct" | "wrong" | "finished">("ready");
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
      <div className="flex flex-col gap-4">
        <LearningBuddy state="finished" />
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
      </div>
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
    setBuddyState("thinking");
    startTransition(async () => {
      const result = await submitAnswer({
        lessonId,
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
      });
      if (!result.ok) {
        setBuddyState("ready");
        setError(result.error);
        return;
      }
      playFeedbackTone(result.isCorrect);
      setBuddyState(result.isCorrect ? "correct" : "wrong");
      setAnswerState({
        status: "answered",
        selectedOptionId: optionId,
        isCorrect: result.isCorrect,
        correctOptionId: result.correctOptionId,
      });
      setResults((prev) => [...prev, result.isCorrect]);
      setStreak((prev) => (result.isCorrect ? prev + 1 : 0));
      setXpEarned((prev) => prev + result.xpAwarded);
      if (result.newBadges.length > 0) {
        setEarnedBadges((prev) => [...prev, ...result.newBadges]);
      }
    });
  }

  function handleNext() {
    setAnswerState({ status: "unanswered" });
    setBuddyState("ready");
    setIndex((current) => current + 1);
  }

  function playFeedbackTone(isCorrect: boolean) {
    if (typeof window === "undefined") return;
    const AudioContextClass = window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(isCorrect ? 660 : 220, context.currentTime);
    oscillator.frequency.linearRampToValueAtTime(isCorrect ? 880 : 180, context.currentTime + 0.16);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.14, context.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.22);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.24);
    oscillator.addEventListener("ended", () => void context.close(), { once: true });
  }

  return (
    <div className="game-board flex flex-col gap-6">
      <LearningBuddy state={buddyState} />
      <GameHud
        level={index + 1}
        totalQuestions={questions.length}
        correctCount={results.filter(Boolean).length}
        streak={streak}
        wrongCount={results.filter((result) => !result).length}
      />
      <div className="flex items-center justify-between text-sm text-muted">
        <span>{lessonTitle}</span>
        <span>
          Soal {index + 1} dari {questions.length}
        </span>
      </div>
      <div className="game-progress-track h-4 w-full overflow-hidden rounded-full bg-border">
        <div
          className="game-progress-fill h-full rounded-full bg-primary transition-[width] duration-500 ease-[var(--ease-in-out)]"
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
