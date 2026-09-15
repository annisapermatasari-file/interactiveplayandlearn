import "server-only";
import { db } from "@/lib/db";

export async function listTeacherClasses(userId: string) {
  return db.class.findMany({
    where: { teacherUserId: userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { members: true } } },
  });
}

export async function getClassForTeacher(classId: string) {
  return db.class.findUnique({
    where: { id: classId },
    include: {
      organization: true,
      members: {
        orderBy: { createdAt: "asc" },
        include: { child: true },
      },
    },
  });
}

/** Children in the class's organization who aren't already a member — candidates to add. */
export async function listAvailableChildren(organizationId: string, classId: string) {
  return db.child.findMany({
    where: {
      organizationId,
      classMemberships: { none: { classId } },
    },
    orderBy: { displayName: "asc" },
  });
}
