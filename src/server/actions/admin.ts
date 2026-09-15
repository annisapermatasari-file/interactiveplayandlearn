"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requireGlobalAdmin } from "@/lib/permissions";

export type FormState = { error?: string } | undefined;

const CONTENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const ACTIVITY_TYPES = [
  "COUNT_SELECT",
  "COUNT_INPUT",
  "MULTIPLE_CHOICE",
  "DRAG_MATCH",
  "TRACE_NUMBER",
  "COUNT_CIRCLE",
  "SAME_AMOUNT",
  "NUMBER_RECOGNITION",
] as const;
const DIFFICULTIES = ["BEGINNER", "EASY", "MEDIUM", "HARD"] as const;
const SKILLS = [
  "COUNT_1_5",
  "COUNT_1_10",
  "COUNT_1_20",
  "NUMBER_RECOGNITION_1_10",
  "MATCH_QUANTITY",
  "VISUAL_COUNTING",
] as const;

function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return slug || "course";
}

async function ensureUniqueCourseSlug(base: string): Promise<string> {
  let candidate = base;
  let suffix = 2;
  while (await db.course.findUnique({ where: { slug: candidate } })) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

// ---------------------------------------------------------------------------
// Course
// ---------------------------------------------------------------------------

const courseSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(150),
  description: z.string().trim().max(1000).optional(),
});

export async function createCourse(_prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = courseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const slug = await ensureUniqueCourseSlug(slugify(parsed.data.title));
  const course = await db.course.create({
    data: { title: parsed.data.title, description: parsed.data.description, slug, status: "DRAFT" },
  });

  revalidatePath("/admin");
  redirect(`/admin/courses/${course.id}`);
}

export async function updateCourse(
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = courseSchema
    .extend({ status: z.enum(CONTENT_STATUSES) })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  await db.course.update({
    where: { id: courseId },
    data: { title: parsed.data.title, description: parsed.data.description, status: parsed.data.status },
  });

  revalidatePath("/admin");
  revalidatePath("/learn");
  revalidatePath(`/learn/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

// ---------------------------------------------------------------------------
// Module
// ---------------------------------------------------------------------------

const moduleSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(150),
});

export async function createModule(
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = moduleSchema.safeParse({ title: formData.get("title") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const position = (await db.courseModule.count({ where: { courseId } })) + 1;
  await db.courseModule.create({
    data: { courseId, title: parsed.data.title, position, status: "DRAFT" },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

export async function updateModule(
  moduleId: string,
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = moduleSchema
    .extend({ status: z.enum(CONTENT_STATUSES) })
    .safeParse({ title: formData.get("title"), status: formData.get("status") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  await db.courseModule.update({
    where: { id: moduleId },
    data: { title: parsed.data.title, status: parsed.data.status },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/learn");
  revalidatePath(`/learn/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}`);
}

// ---------------------------------------------------------------------------
// Lesson
// ---------------------------------------------------------------------------

const lessonSchema = z.object({
  title: z.string().trim().min(1, "Judul wajib diisi.").max(150),
  description: z.string().trim().max(1000).optional(),
});

export async function createLesson(
  moduleId: string,
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const position = (await db.lesson.count({ where: { moduleId } })) + 1;
  const lesson = await db.lesson.create({
    data: {
      moduleId,
      title: parsed.data.title,
      description: parsed.data.description,
      position,
      status: "DRAFT",
    },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lesson.id}`);
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = lessonSchema
    .extend({ status: z.enum(CONTENT_STATUSES) })
    .safeParse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  await db.lesson.update({
    where: { id: lessonId },
    data: { title: parsed.data.title, description: parsed.data.description, status: parsed.data.status },
  });

  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath("/learn");
  revalidatePath(`/learn/lessons/${lessonId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

// ---------------------------------------------------------------------------
// Activity
// ---------------------------------------------------------------------------

const activitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  title: z.string().trim().min(1, "Judul wajib diisi.").max(150),
  difficulty: z.enum(DIFFICULTIES),
});

export async function createActivity(
  lessonId: string,
  courseId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = activitySchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    difficulty: formData.get("difficulty"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const position = (await db.activity.count({ where: { lessonId } })) + 1;
  await db.activity.create({
    data: {
      lessonId,
      type: parsed.data.type,
      title: parsed.data.title,
      difficulty: parsed.data.difficulty,
      position,
      status: "DRAFT",
    },
  });

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function updateActivity(
  activityId: string,
  courseId: string,
  lessonId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = activitySchema
    .omit({ type: true })
    .extend({ status: z.enum(CONTENT_STATUSES) })
    .safeParse({
      title: formData.get("title"),
      difficulty: formData.get("difficulty"),
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  await db.activity.update({
    where: { id: activityId },
    data: { title: parsed.data.title, difficulty: parsed.data.difficulty, status: parsed.data.status },
  });

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/learn/lessons/${lessonId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

// ---------------------------------------------------------------------------
// Question — option-based shape shared by COUNT_SELECT / MULTIPLE_CHOICE /
// NUMBER_RECOGNITION (see prisma/seed.ts and the activity engine, Phase 5).
// ---------------------------------------------------------------------------

const questionBaseSchema = z.object({
  skill: z.enum(SKILLS),
  prompt: z.string().trim().min(1, "Prompt wajib diisi.").max(500),
});

const OPTION_SLOTS = [1, 2, 3, 4] as const;
const OPTION_LETTERS = ["a", "b", "c", "d"];

function parseOptionsFromForm(formData: FormData): { error: string } | { options: { id: string; label: string }[]; correctAnswer: { optionId: string } } {
  const filled = OPTION_SLOTS.map((slot) => {
    const raw = formData.get(`option${slot}`);
    return { slot, label: typeof raw === "string" ? raw.trim() : "" };
  }).filter((entry) => entry.label.length > 0);

  if (filled.length < 2) {
    return { error: "Isi minimal 2 pilihan jawaban." };
  }

  const correctSlotRaw = formData.get("correctOption");
  const correctSlot = typeof correctSlotRaw === "string" ? Number(correctSlotRaw) : NaN;
  const correctIndex = filled.findIndex((entry) => entry.slot === correctSlot);
  if (correctIndex === -1) {
    return { error: "Pilih salah satu jawaban yang benar." };
  }

  const options = filled.map((entry, index) => ({ id: OPTION_LETTERS[index], label: entry.label }));
  return { options, correctAnswer: { optionId: OPTION_LETTERS[correctIndex] } };
}

export async function createQuestion(
  activityId: string,
  courseId: string,
  lessonId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = questionBaseSchema.safeParse({
    skill: formData.get("skill"),
    prompt: formData.get("prompt"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const optionsResult = parseOptionsFromForm(formData);
  if ("error" in optionsResult) return { error: optionsResult.error };

  const position = (await db.question.count({ where: { activityId } })) + 1;
  await db.question.create({
    data: {
      activityId,
      skill: parsed.data.skill,
      prompt: parsed.data.prompt,
      options: optionsResult.options,
      correctAnswer: optionsResult.correctAnswer,
      position,
      status: "DRAFT",
    },
  });

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lessonId}`);
}

export async function updateQuestion(
  questionId: string,
  courseId: string,
  lessonId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  await requireGlobalAdmin(user.id);

  const parsed = questionBaseSchema
    .extend({ status: z.enum(CONTENT_STATUSES) })
    .safeParse({
      skill: formData.get("skill"),
      prompt: formData.get("prompt"),
      status: formData.get("status"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const optionsResult = parseOptionsFromForm(formData);
  if ("error" in optionsResult) return { error: optionsResult.error };

  await db.question.update({
    where: { id: questionId },
    data: {
      skill: parsed.data.skill,
      prompt: parsed.data.prompt,
      options: optionsResult.options,
      correctAnswer: optionsResult.correctAnswer,
      status: parsed.data.status,
    },
  });

  revalidatePath(`/admin/courses/${courseId}/lessons/${lessonId}`);
  revalidatePath(`/learn/lessons/${lessonId}`);
  redirect(`/admin/courses/${courseId}/lessons/${lessonId}`);
}
