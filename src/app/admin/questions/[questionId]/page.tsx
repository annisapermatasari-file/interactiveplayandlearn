import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireGlobalAdmin, ForbiddenError } from "@/lib/permissions";
import { getQuestionForAdmin } from "@/lib/admin";
import { updateQuestion } from "@/server/actions/admin";
import { Card } from "@/components/ui/Card";
import { QuestionForm } from "@/components/admin/QuestionForm";
import type { ChildSafeOption } from "@/types/learning";

export default async function AdminQuestionPage({ params }: PageProps<"/admin/questions/[questionId]">) {
  const { questionId } = await params;
  const user = await requireUser();
  await requireGlobalAdmin(user.id).catch((error) => {
    if (error instanceof ForbiddenError) notFound();
    throw error;
  });

  const question = await getQuestionForAdmin(questionId);
  if (!question) notFound();

  const lesson = question.activity.lesson;
  const courseId = lesson.module.courseId;
  const correctAnswer = question.correctAnswer as { optionId: string };

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}`} className="text-sm text-muted underline">
          ← {lesson.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Soal</h1>
      </div>

      <Card>
        <QuestionForm
          action={updateQuestion.bind(null, questionId, courseId, lesson.id)}
          submitLabel="Simpan Perubahan"
          defaultValues={{
            skill: question.skill,
            prompt: question.prompt,
            status: question.status,
            options: question.options as ChildSafeOption[] | null,
            correctOptionId: correctAnswer.optionId,
          }}
          showStatus
        />
      </Card>
    </main>
  );
}
