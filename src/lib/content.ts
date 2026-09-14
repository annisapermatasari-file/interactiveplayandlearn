import "server-only";
import { db } from "@/lib/db";
import type { ActivityType } from "@/generated/prisma/client";

// Content-browsing queries only ever filter to PUBLISHED and never select
// Question.correctAnswer — draft content and answer keys must never reach a
// child-facing page. The interactive activity engine (Phase 5) is what
// eventually needs question detail, and will apply the same PUBLISHED
// filter plus its own server-side answer check.

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

export async function listPublishedCourses() {
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, title: true, description: true },
  });
}

export async function getPublishedCourseById(courseId: string) {
  return db.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    include: {
      modules: {
        where: { status: "PUBLISHED" },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { status: "PUBLISHED" },
            orderBy: { position: "asc" },
            include: {
              _count: { select: { activities: true } },
            },
          },
        },
      },
    },
  });
}

export async function getPublishedLessonById(lessonId: string) {
  return db.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      module: { status: "PUBLISHED", course: { status: "PUBLISHED" } },
    },
    include: {
      module: { include: { course: true } },
      activities: {
        where: { status: "PUBLISHED" },
        orderBy: { position: "asc" },
        include: { _count: { select: { questions: true } } },
      },
    },
  });
}

export async function getEnrollment(childId: string, courseId: string) {
  return db.enrollment.findUnique({
    where: { childId_courseId: { childId, courseId } },
  });
}

/**
 * Question data for the interactive player. Still PUBLISHED-only at every
 * level, and still never selects `correctAnswer` — the player only ever
 * learns whether an answer was right via submitAnswer's response, after the
 * child has already committed to it.
 */
export async function getLessonQuestionsForPlay(lessonId: string) {
  return db.lesson.findFirst({
    where: {
      id: lessonId,
      status: "PUBLISHED",
      module: { status: "PUBLISHED", course: { status: "PUBLISHED" } },
    },
    include: {
      activities: {
        where: { status: "PUBLISHED" },
        orderBy: { position: "asc" },
        include: {
          questions: {
            where: { status: "PUBLISHED" },
            orderBy: { position: "asc" },
            select: {
              id: true,
              prompt: true,
              imageUrl: true,
              audioUrl: true,
              options: true,
              skill: true,
            },
          },
        },
      },
    },
  });
}
