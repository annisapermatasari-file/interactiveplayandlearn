export function speakBuddy(message: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  const voices = window.speechSynthesis.getVoices();
  const IndonesianVoice = voices.find((voice) => voice.lang.toLowerCase().startsWith("id"));

  if (IndonesianVoice) utterance.voice = IndonesianVoice;
  utterance.lang = IndonesianVoice?.lang ?? "id-ID";
  utterance.rate = 1.04;
  utterance.pitch = 1.35;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  return true;
}
