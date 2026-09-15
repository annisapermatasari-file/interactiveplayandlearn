"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requireClassAccess, requireClassroomOrganizationRole } from "@/lib/permissions";

export type FormState = { error?: string } | undefined;

const classSchema = z.object({
  name: z.string().trim().min(1, "Nama kelas wajib diisi.").max(150),
});

export async function createClass(_prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const membership = await requireClassroomOrganizationRole(user.id);

  const parsed = classSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  const classRecord = await db.class.create({
    data: {
      organizationId: membership.organizationId,
      name: parsed.data.name,
      teacherUserId: user.id,
    },
  });

  revalidatePath("/teacher");
  redirect(`/teacher/classes/${classRecord.id}`);
}

const addMemberSchema = z.object({
  childId: z.string().min(1, "Pilih anak yang akan ditambahkan."),
});

export async function addClassMember(
  classId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  const classRecord = await requireClassAccess(user.id, classId);

  const parsed = addMemberSchema.safeParse({ childId: formData.get("childId") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };

  // The child must belong to the same organization as the class — otherwise
  // a forged childId could enroll a child from an unrelated organization.
  const child = await db.child.findUnique({ where: { id: parsed.data.childId } });
  if (!child || child.organizationId !== classRecord.organizationId) {
    return { error: "Anak tidak ditemukan di organisasi ini." };
  }

  await db.classMember.upsert({
    where: { classId_childId: { classId, childId: child.id } },
    update: {},
    create: { classId, childId: child.id },
  });

  revalidatePath(`/teacher/classes/${classId}`);
  redirect(`/teacher/classes/${classId}`);
}

export async function removeClassMember(
  classMemberId: string,
  classId: string,
): Promise<void> {
  const user = await requireUser();
  await requireClassAccess(user.id, classId);

  // requireClassAccess above only proves the caller may manage `classId`.
  // Scoping the delete to {id, classId} together (not just id) stops a
  // classMemberId that actually belongs to a DIFFERENT class from being
  // deleted through this call — it only affects a row that is both the
  // given id AND a member of the class just verified.
  await db.classMember.deleteMany({ where: { id: classMemberId, classId } });

  revalidatePath(`/teacher/classes/${classId}`);
  redirect(`/teacher/classes/${classId}`);
}
