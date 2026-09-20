"use client";

import { useState } from "react";
import { LearningBuddy } from "@/components/learning/LearningBuddy";

export function BuddyWelcome({ message = "Pilih permainan yang ingin kamu coba!" }: { message?: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  function speak() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = "id-ID";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <div className={isSpeaking ? "buddy-speaking" : undefined}>
      <LearningBuddy state="ready" onInteract={speak} />
    </div>
  );
}
