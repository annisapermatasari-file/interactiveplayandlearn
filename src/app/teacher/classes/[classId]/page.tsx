import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireClassAccess, ForbiddenError } from "@/lib/permissions";
import { getClassForTeacher, listAvailableChildren } from "@/lib/teacher";
import { getChildDashboardData } from "@/lib/progress";
import { addClassMember, removeClassMember } from "@/server/actions/teacher";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AddChildForm } from "@/components/teacher/AddChildForm";

export default async function TeacherClassPage({ params }: PageProps<"/teacher/classes/[classId]">) {
  const { classId } = await params;
  const user = await requireUser();

  const classRecord = await requireClassAccess(user.id, classId).catch((error) => {
    if (error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!classRecord) notFound();

  const [classDetail, availableChildren] = await Promise.all([
    getClassForTeacher(classId),
    listAvailableChildren(classRecord.organizationId, classId),
  ]);
  if (!classDetail) notFound();

  const memberStats = await Promise.all(
    classDetail.members.map(async (member) => ({
      member,
      stats: await getChildDashboardData(member.childId),
    })),
  );

  const membersWithAttempts = memberStats.filter((m) => m.stats.totalAttempts > 0);
  const classTotalXp = memberStats.reduce((sum, m) => sum + m.stats.totalXp, 0);
  const classTotalLessonsCompleted = memberStats.reduce((sum, m) => sum + m.stats.completedLessonsCount, 0);
  const classAverageAccuracy =
    membersWithAttempts.length > 0
      ? Math.round(membersWithAttempts.reduce((sum, m) => sum + m.stats.accuracy, 0) / membersWithAttempts.length)
      : 0;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/teacher" className="text-sm text-muted underline">
          ← Semua Kelas
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{classDetail.name}</h1>
        <p className="mt-1 text-sm text-muted">{classDetail.organization.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col items-center gap-1 py-4 text-center">
          <span className="text-2xl font-semibold">{classDetail.members.length}</span>
          <span className="text-sm text-muted">Murid</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-4 text-center">
          <span className="text-2xl font-semibold">{classAverageAccuracy}%</span>
          <span className="text-sm text-muted">Rata-rata Akurasi</span>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-4 text-center">
          <span className="text-2xl font-semibold">{classTotalLessonsCompleted}</span>
          <span className="text-sm text-muted">Pelajaran Selesai</span>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Daftar Murid</h2>
        {memberStats.map(({ member, stats }) => (
          <Card key={member.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{member.child.avatarUrl ?? "🙂"}</span>
              <div>
                <p className="font-medium">{member.child.displayName}</p>
                <p className="text-sm text-muted">
                  {stats.totalXp} XP · {stats.accuracy}% akurasi · {stats.completedLessonsCount}/
                  {stats.totalPublishedLessons} pelajaran
                </p>
              </div>
            </div>
            <form action={removeClassMember.bind(null, member.id, classId)}>
              <Button type="submit" size="sm" variant="ghost">
                Keluarkan
              </Button>
            </form>
          </Card>
        ))}
        {classDetail.members.length === 0 ? (
          <p className="text-sm text-muted">Belum ada murid di kelas ini.</p>
        ) : null}
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Tambah Murid</h2>
        <p className="mt-1 text-sm text-muted">
          Total XP kelas: {classTotalXp}. Murid ditambahkan dari organisasi yang sama.
        </p>
        <div className="mt-4">
          <AddChildForm action={addClassMember.bind(null, classId)} availableChildren={availableChildren} />
        </div>
      </Card>
    </main>
  );
}
