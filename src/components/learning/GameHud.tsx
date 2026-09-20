"use client";

export function GameHud({
  level,
  totalQuestions,
  correctCount,
  streak,
  wrongCount,
}: {
  level: number;
  totalQuestions: number;
  correctCount: number;
  streak: number;
  wrongCount: number;
}) {
  const hearts = Math.max(0, 3 - Math.min(3, wrongCount));
  const score = correctCount * 10;

  return (
    <div className="game-hud grid grid-cols-3 gap-2 rounded-3xl border-2 border-white/80 bg-white/85 p-2 shadow-sm backdrop-blur-sm sm:gap-3 sm:p-3">
      <div className="game-stat">
        <span className="game-stat-icon" aria-hidden>🎯</span>
        <span className="game-stat-label">Level {level}/{totalQuestions}</span>
      </div>
      <div className="game-stat">
        <span className="game-stat-icon" aria-hidden>⭐</span>
        <span className="game-stat-label">{score} poin</span>
      </div>
      <div className="game-stat">
        <span className="game-stat-icon" aria-hidden>{"❤️".repeat(hearts) || "🤍"}</span>
        <span className="game-stat-label">{streak > 1 ? `${streak} combo` : "Ayo coba!"}</span>
      </div>
    </div>
  );
}
