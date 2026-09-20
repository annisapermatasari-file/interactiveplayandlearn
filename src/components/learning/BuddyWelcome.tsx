"use client";

import { useState } from "react";
import { LearningBuddy } from "@/components/learning/LearningBuddy";
import { speakBuddy } from "@/lib/buddyVoice";

export function BuddyWelcome({ message = "Pilih permainan yang ingin kamu coba!" }: { message?: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  function speak() {
    const started = speakBuddy(message);
    if (!started) return;
    setIsSpeaking(true);
    window.setTimeout(() => setIsSpeaking(false), Math.max(900, message.length * 65));
  }

  return (
    <div className={isSpeaking ? "buddy-speaking" : undefined}>
      <LearningBuddy state="ready" onInteract={speak} />
    </div>
  );
}
