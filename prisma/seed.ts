import "dotenv/config";
import { PrismaClient, type Skill, type ActivityType, type ContentStatus } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

// Development credentials only — never reuse these in a real environment.
const DEV_PASSWORD = "ChangeMe123!";

type Option = { id: string; label: string };

/**
 * Distinct numeric distractors near `correct`, widening the search window
 * outward so counts near the edges of [1, max] still yield three options.
 */
function distractors(correct: number, max: number): number[] {
  const offsets = [-3, -2, -1, 1, 2, 3, -4, 4, -5, 5];
  const result: number[] = [];
  for (const offset of offsets) {
    const n = correct + offset;
    if (n >= 1 && n <= max && n !== correct && !result.includes(n)) {
      result.push(n);
      if (result.length === 3) break;
    }
  }
  return result;
}

/** Builds a 4-option question, rotating the correct answer's position deterministically by `seedIndex`. */
function buildOptions(
  correctLabel: string,
  distractorLabels: string[],
  seedIndex: number,
): { options: Option[]; correctOptionId: string } {
  const letters = ["a", "b", "c", "d"];
  const values = [correctLabel, ...distractorLabels];
  const rotation = seedIndex % values.length;
  const rotated = [...values.slice(rotation), ...values.slice(0, rotation)];
  const options = rotated.map((label, i) => ({ id: letters[i], label }));
  const correctOptionId = options[(values.length - rotation) % values.length].id;
  return { options, correctOptionId };
}

/** "How many?" — child counts an emoji group and picks the matching number. */
function countSelectQuestion(seedIndex: number, emoji: string, count: number, max: number, skill: Skill) {
  const { options, correctOptionId } = buildOptions(
    String(count),
    distractors(count, max).map(String),
    seedIndex,
  );
  return {
    skill,
    prompt: `${emoji.repeat(count)}\nAda berapa banyak?`,
    options,
    correctAnswer: { optionId: correctOptionId },
  };
}

/** Numeral shown; child picks the emoji group with the matching quantity. */
function numberRecognitionQuestion(seedIndex: number, emoji: string, target: number, max: number, skill: Skill) {
  const { options, correctOptionId } = buildOptions(
    emoji.repeat(target),
    distractors(target, max).map((n) => emoji.repeat(n)),
    seedIndex,
  );
  return {
    skill,
    prompt: `Pilih kumpulan dengan jumlah ${target}.`,
    options,
    correctAnswer: { optionId: correctOptionId },
  };
}

/** A reference group is shown; child picks the other group with the same quantity. */
function matchAmountQuestion(
  seedIndex: number,
  referenceEmoji: string,
  optionEmoji: string,
  target: number,
  max: number,
  skill: Skill,
) {
  const { options, correctOptionId } = buildOptions(
    optionEmoji.repeat(target),
    distractors(target, max).map((n) => optionEmoji.repeat(n)),
    seedIndex,
  );
  return {
    skill,
    prompt: `${referenceEmoji.repeat(target)}\nPilih kumpulan dengan jumlah yang sama.`,
    options,
    correctAnswer: { optionId: correctOptionId },
  };
}

type LessonDef = {
  title: string;
  description: string;
  activityType: ActivityType;
  skill: Skill;
  emoji: string;
  emoji2?: string;
  max: number;
  counts: number[];
};

const moduleDefs: { title: string; lessons: LessonDef[] }[] = [
  {
    title: "Mengenal Berhitung",
    lessons: [
      {
        title: "Count and Match",
        description: "Menghitung kumpulan benda dan mencocokkan dengan angka.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_5",
        emoji: "🍎",
        max: 5,
        counts: [1, 2, 3, 4, 5],
      },
      {
        title: "Trace and Match",
        description: "Latihan mengenali jumlah sambil menjiplak angka.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_5",
        emoji: "⭐",
        max: 5,
        counts: [2, 3, 4, 5, 1],
      },
      {
        title: "Count and Circle",
        description: "Menghitung benda lalu memilih jumlah yang tepat.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🎈",
        max: 10,
        counts: [3, 5, 7, 8, 10],
      },
      {
        title: "Fruits Counting",
        description: "Menghitung buah-buahan dalam kelompok kecil.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🍇",
        max: 10,
        counts: [2, 4, 6, 8, 9],
      },
      {
        title: "Count the Fruits",
        description: "Latihan lanjutan menghitung buah-buahan.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🍊",
        max: 10,
        counts: [1, 3, 5, 7, 10],
      },
    ],
  },
  {
    title: "Latihan Berhitung",
    lessons: [
      {
        title: "Counting Practice",
        description: "Latihan berhitung campuran untuk memperkuat pemahaman.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🧸",
        max: 10,
        counts: [2, 4, 5, 7, 9],
      },
      {
        title: "Match the Same Amount",
        description: "Menemukan kumpulan benda dengan jumlah yang sama.",
        activityType: "MULTIPLE_CHOICE",
        skill: "MATCH_QUANTITY",
        emoji: "🍎",
        emoji2: "🍊",
        max: 10,
        counts: [2, 3, 5, 6, 8],
      },
      {
        title: "Counting Objects",
        description: "Menghitung berbagai benda sehari-hari.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🚗",
        max: 10,
        counts: [3, 4, 6, 8, 10],
      },
      {
        title: "Let's Count",
        description: "Latihan berhitung dengan tema kendaraan.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🚲",
        max: 10,
        counts: [1, 2, 4, 6, 9],
      },
      {
        title: "Fish in the Jar",
        description: "Menghitung ikan di dalam toples.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_10",
        emoji: "🐟",
        max: 10,
        counts: [3, 5, 6, 8, 10],
      },
    ],
  },
  {
    title: "Tantangan Berhitung",
    lessons: [
      {
        title: "How Many?",
        description: "Tantangan menghitung jumlah yang lebih besar.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_20",
        emoji: "🎈",
        max: 20,
        counts: [8, 11, 14, 17, 20],
      },
      {
        title: "Dinosaur Counting",
        description: "Menghitung dinosaurus dengan tema seru.",
        activityType: "COUNT_SELECT",
        skill: "COUNT_1_20",
        emoji: "🦕",
        max: 20,
        counts: [6, 10, 13, 16, 19],
      },
      {
        title: "Number Recognition",
        description: "Mengenali angka dan mencocokkan dengan jumlah benda.",
        activityType: "NUMBER_RECOGNITION",
        skill: "NUMBER_RECOGNITION_1_10",
        emoji: "🐠",
        max: 10,
        counts: [2, 4, 5, 7, 9],
      },
      {
        title: "Extra Counting Practice",
        description: "Latihan tambahan untuk memperkuat semua keterampilan berhitung.",
        activityType: "COUNT_SELECT",
        skill: "VISUAL_COUNTING",
        emoji: "🍭",
        max: 10,
        counts: [2, 3, 5, 7, 8],
      },
    ],
  },
];

const badgeDefs = [
  { code: "FIRST_LESSON", name: "First Lesson", description: "Menyelesaikan pelajaran pertama." },
  { code: "COUNTING_STARTER", name: "Counting Starter", description: "Memulai perjalanan belajar berhitung." },
  { code: "FIVE_LESSONS", name: "5 Lessons Complete", description: "Menyelesaikan 5 pelajaran." },
  { code: "COUNTING_CHAMPION", name: "Counting Champion", description: "Menyelesaikan seluruh kursus Counting Fundamentals." },
  { code: "PERFECT_LESSON", name: "Perfect Lesson", description: "Menjawab semua soal dengan benar dalam satu pelajaran." },
  { code: "SEVEN_DAY_STREAK", name: "7 Day Streak", description: "Belajar 7 hari berturut-turut." },
];

const PUBLISHED: ContentStatus = "PUBLISHED";

async function main() {
  const organization = await db.organization.upsert({
    where: { id: "org-demo-family" },
    update: {},
    create: {
      id: "org-demo-family",
      name: "Demo Family",
      type: "INDIVIDUAL",
    },
  });

  const adminPasswordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const admin = await db.user.upsert({
    where: { email: "admin@countinglms.dev" },
    update: {},
    create: {
      email: "admin@countinglms.dev",
      name: "Counting LMS Admin",
      passwordHash: adminPasswordHash,
    },
  });
  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: admin.id } },
    update: { role: "ADMIN" },
    create: { organizationId: organization.id, userId: admin.id, role: "ADMIN" },
  });

  const parentPasswordHash = await bcrypt.hash(DEV_PASSWORD, 10);
  const parent = await db.user.upsert({
    where: { email: "parent@countinglms.dev" },
    update: {},
    create: {
      email: "parent@countinglms.dev",
      name: "Demo Parent",
      passwordHash: parentPasswordHash,
    },
  });
  await db.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: organization.id, userId: parent.id } },
    update: { role: "PARENT" },
    create: { organizationId: organization.id, userId: parent.id, role: "PARENT" },
  });

  const child = await db.child.upsert({
    where: { id: "child-demo-1" },
    update: {},
    create: {
      id: "child-demo-1",
      organizationId: organization.id,
      parentUserId: parent.id,
      displayName: "Bintang",
      ageBand: "AGE_5_6",
    },
  });

  const course = await db.course.upsert({
    where: { slug: "counting-fundamentals" },
    update: { title: "Counting Fundamentals", status: PUBLISHED },
    create: {
      slug: "counting-fundamentals",
      title: "Counting Fundamentals",
      description: "Kursus dasar berhitung untuk anak usia dini.",
      status: PUBLISHED,
    },
  });

  await db.enrollment.upsert({
    where: { childId_courseId: { childId: child.id, courseId: course.id } },
    update: {},
    create: { childId: child.id, courseId: course.id },
  });

  let globalQuestionIndex = 0;

  for (let m = 0; m < moduleDefs.length; m++) {
    const moduleDef = moduleDefs[m];
    const courseModule = await db.courseModule.upsert({
      where: { courseId_position: { courseId: course.id, position: m + 1 } },
      update: { title: moduleDef.title, status: PUBLISHED },
      create: {
        courseId: course.id,
        title: moduleDef.title,
        position: m + 1,
        status: PUBLISHED,
      },
    });

    for (let l = 0; l < moduleDef.lessons.length; l++) {
      const lessonDef = moduleDef.lessons[l];
      const lesson = await db.lesson.upsert({
        where: { moduleId_position: { moduleId: courseModule.id, position: l + 1 } },
        update: { title: lessonDef.title, description: lessonDef.description, status: PUBLISHED },
        create: {
          moduleId: courseModule.id,
          title: lessonDef.title,
          description: lessonDef.description,
          position: l + 1,
          status: PUBLISHED,
        },
      });

      const activity = await db.activity.upsert({
        where: { lessonId_position: { lessonId: lesson.id, position: 1 } },
        update: { type: lessonDef.activityType, title: lessonDef.title, status: PUBLISHED },
        create: {
          lessonId: lesson.id,
          type: lessonDef.activityType,
          title: lessonDef.title,
          position: 1,
          difficulty: "EASY",
          status: PUBLISHED,
        },
      });

      for (let q = 0; q < lessonDef.counts.length; q++) {
        const count = lessonDef.counts[q];
        const spec =
          lessonDef.activityType === "NUMBER_RECOGNITION"
            ? numberRecognitionQuestion(globalQuestionIndex, lessonDef.emoji, count, lessonDef.max, lessonDef.skill)
            : lessonDef.activityType === "MULTIPLE_CHOICE"
              ? matchAmountQuestion(
                  globalQuestionIndex,
                  lessonDef.emoji,
                  lessonDef.emoji2 ?? lessonDef.emoji,
                  count,
                  lessonDef.max,
                  lessonDef.skill,
                )
              : countSelectQuestion(globalQuestionIndex, lessonDef.emoji, count, lessonDef.max, lessonDef.skill);
        globalQuestionIndex++;

        await db.question.upsert({
          where: { activityId_position: { activityId: activity.id, position: q + 1 } },
          update: {
            skill: spec.skill,
            prompt: spec.prompt,
            options: spec.options,
            correctAnswer: spec.correctAnswer,
            status: PUBLISHED,
          },
          create: {
            activityId: activity.id,
            skill: spec.skill,
            prompt: spec.prompt,
            options: spec.options,
            correctAnswer: spec.correctAnswer,
            position: q + 1,
            status: PUBLISHED,
          },
        });
      }
    }
  }

  for (const badge of badgeDefs) {
    await db.badge.upsert({
      where: { code: badge.code },
      update: { name: badge.name, description: badge.description },
      create: badge,
    });
  }

  await db.subscription.upsert({
    where: { organizationId: organization.id },
    update: {},
    create: { organizationId: organization.id, plan: "FREE", status: "ACTIVE" },
  });

  console.log("Seed complete:");
  console.log(`  Organization: ${organization.name} (${organization.id})`);
  console.log(`  Admin login:  admin@countinglms.dev / ${DEV_PASSWORD}`);
  console.log(`  Parent login: parent@countinglms.dev / ${DEV_PASSWORD}`);
  console.log(`  Child:        ${child.displayName} (${child.id})`);
  console.log(`  Course:       ${course.title} — ${moduleDefs.length} modules, ${moduleDefs.reduce((n, m) => n + m.lessons.length, 0)} lessons, ${globalQuestionIndex} questions`);
  console.log(`  Badges:       ${badgeDefs.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
