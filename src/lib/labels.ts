// Plain label dictionaries with no DB access — deliberately NOT server-only,
// so client components (admin forms) can import them directly without
// pulling in db.ts/pg. src/lib/content.ts re-exports these for server-side
// consumers that already import it for its query functions.
import type { ActivityType, Skill } from "@/generated/prisma/client";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  COUNT_SELECT: "Hitung & Pilih",
  COUNT_INPUT: "Hitung & Isi",
  MULTIPLE_CHOICE: "Pilihan Ganda",
  DRAG_MATCH: "Cocokkan",
  TRACE_NUMBER: "Jiplak Angka",
  COUNT_CIRCLE: "Hitung & Lingkari",
  SAME_AMOUNT: "Jumlah Sama",
  NUMBER_RECOGNITION: "Kenali Angka",
};

export const SKILL_LABELS: Record<Skill, string> = {
  COUNT_1_5: "Berhitung 1–5",
  COUNT_1_10: "Berhitung 1–10",
  COUNT_1_20: "Berhitung 1–20",
  NUMBER_RECOGNITION_1_10: "Mengenal Angka 1–10",
  MATCH_QUANTITY: "Mencocokkan Jumlah",
  VISUAL_COUNTING: "Berhitung Visual",
};
