"use client";

import { cn } from "@/lib/utils";

export function LearningBuddy({ state }: { state: "ready" | "thinking" | "correct" | "wrong" | "finished" }) {
  const content = {
    ready: { face: "🦊", message: "Aku siap menemanimu! Kamu pasti bisa." },
    thinking: { face: "🦊", message: "Hmm, pilih jawaban yang menurutmu paling tepat." },
    correct: { face: "🥳", message: "Hebat! Jawabanmu benar!" },
    wrong: { face: "🤔", message: "Tidak apa-apa. Yuk coba lagi di soal berikutnya." },
    finished: { face: "🏆", message: "Kamu sudah menyelesaikan pelajaran!" },
  }[state];

  return (
    <aside
      className={cn(
        "buddy-panel flex items-center gap-3 rounded-3xl border-2 border-accent/70 bg-accent/20 px-4 py-3",
        state === "correct" && "buddy-panel-correct",
        state === "wrong" && "buddy-panel-wrong",
      )}
      aria-live="polite"
    >
      <span className="buddy-face flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">
        {content.face}
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-accent-foreground">Buddy Belajar</p>
        <p className="text-sm font-medium text-foreground">{content.message}</p>
      </div>
    </aside>
  );
}
