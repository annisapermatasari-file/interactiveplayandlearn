// Shared between the avatar picker (client) and the child server actions
// (validation), so the allowed set only lives in one place. Emoji avatars
// are used instead of photo uploads — no child imagery is collected.
export const AVATAR_OPTIONS = ["🦁", "🐯", "🐰", "🦊", "🐼", "🐨", "🐸", "🦄", "🐢", "🐬"] as const;

export const AGE_BAND_OPTIONS = [
  { value: "AGE_3_4", label: "3–4 tahun" },
  { value: "AGE_5_6", label: "5–6 tahun" },
  { value: "AGE_7_8", label: "7–8 tahun" },
  { value: "AGE_9_PLUS", label: "9+ tahun" },
] as const;

export const AGE_BAND_LABELS: Record<string, string> = Object.fromEntries(
  AGE_BAND_OPTIONS.map((option) => [option.value, option.label]),
);
