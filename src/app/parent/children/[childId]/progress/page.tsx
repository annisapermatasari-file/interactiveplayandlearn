import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireChildAccess, ForbiddenError } from "@/lib/permissions";
import { getChildDashboardData } from "@/lib/progress";
import { getRecommendations } from "@/lib/recommendations";
import { SKILL_LABELS } from "@/lib/content";
import { Card } from "@/components/ui/Card";
import { StatTile } from "@/components/parent/StatTile";

export default async function ChildProgressPage({
  params,
}: PageProps<"/parent/children/[childId]/progress">) {
  const { childId } = await params;
  const user = await requireUser();

  const child = await requireChildAccess(user.id, childId).catch((error) => {
    if (error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!child) notFound();

  const data = await getChildDashboardData(childId);

  // Only skills with a couple of attempts qualify — one lucky or unlucky
  // answer shouldn't label a skill "strong" or "needs practice" yet.
  const qualifyingSkills = data.skillMastery.filter((skill) => skill.attemptsTotal >= 2);
  const strongSkills = qualifyingSkills.filter((skill) => skill.masteryScore >= 0.8).slice(0, 3);
  const weakSkills = [...qualifyingSkills]
    .filter((skill) => skill.masteryScore < 0.7)
    .sort((a, b) => a.masteryScore - b.masteryScore)
    .slice(0, 3);

  const recommendations = getRecommendations({
    totalAttempts: data.totalAttempts,
    currentStreak: data.streak,
    weakestSkill: weakSkills[0] ? { skill: weakSkills[0].skill, masteryScore: weakSkills[0].masteryScore } : null,
    isCourseFullyCompleted: data.totalPublishedLessons > 0 && data.completedLessonsCount >= data.totalPublishedLessons,
  });

  const currentCourseTitle =
    data.currentLessonProgress?.lesson.module.course.title ?? data.enrollments[0]?.course.title ?? null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/parent" className="text-sm text-muted underline">
          ← Kembali ke Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Progres {child.displayName}</h1>
        {currentCourseTitle ? <p className="mt-1 text-sm text-muted">Kursus: {currentCourseTitle}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="XP" value={data.totalXp} />
        <StatTile label="Bintang" value={data.totalStars} />
        <StatTile label="Lencana" value={data.badges.length} />
        <StatTile label="Streak" value={`${data.streak} hari`} />
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Progres Kursus</h2>
        <p className="mt-1 text-sm text-muted">
          {data.completedLessonsCount} dari {data.totalPublishedLessons} pelajaran selesai ({data.overallProgressPercent}%)
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${data.overallProgressPercent}%` }}
          />
        </div>
        {data.currentLessonProgress ? (
          <p className="mt-3 text-sm text-muted">
            Pelajaran terakhir:{" "}
            <Link
              href={`/learn/lessons/${data.currentLessonProgress.lessonId}`}
              className="text-primary underline"
            >
              {data.currentLessonProgress.lesson.title}
            </Link>
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">Belum ada pelajaran yang dimulai.</p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold">Performa Belajar</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted">Soal dijawab</dt>
            <dd className="font-medium">{data.totalAttempts}</dd>
          </div>
          <div>
            <dt className="text-muted">Akurasi</dt>
            <dd className="font-medium">{data.accuracy}%</dd>
          </div>
        </dl>

        {strongSkills.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-success">Kemampuan kuat</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-muted">
              {strongSkills.map((skill) => (
                <li key={skill.id}>{SKILL_LABELS[skill.skill]}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {weakSkills.length > 0 ? (
          <div className="mt-4">
            <p className="text-sm font-medium text-danger">Perlu latihan</p>
            <ul className="mt-1 flex flex-col gap-0.5 text-sm text-muted">
              {weakSkills.map((skill) => (
                <li key={skill.id}>{SKILL_LABELS[skill.skill]}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      {data.badges.length > 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">Lencana</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.badges.map((badge) => (
              <span key={badge.code} className="rounded-full bg-accent/20 px-3 py-1 text-sm">
                🏅 {badge.name}
              </span>
            ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold">Rekomendasi</h2>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
          {recommendations.map((recommendation) => (
            <li key={recommendation.id}>💡 {recommendation.message}</li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
