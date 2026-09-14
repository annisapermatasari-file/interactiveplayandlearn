"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { requireUser, requireChildAccess, getPrimaryOrganizationMembership } from "@/lib/permissions";
import { AVATAR_OPTIONS } from "@/lib/childOptions";

const AGE_BANDS = ["AGE_3_4", "AGE_5_6", "AGE_7_8", "AGE_9_PLUS"] as const;

const childInputSchema = z.object({
  displayName: z.string().trim().min(1, "Nama wajib diisi.").max(50, "Nama terlalu panjang."),
  avatarUrl: z.enum(AVATAR_OPTIONS).optional(),
  ageBand: z.enum(AGE_BANDS).optional(),
});

function parseChildForm(formData: FormData) {
  const avatarRaw = formData.get("avatarUrl");
  const ageBandRaw = formData.get("ageBand");
  return childInputSchema.safeParse({
    displayName: formData.get("displayName"),
    avatarUrl: typeof avatarRaw === "string" && avatarRaw ? avatarRaw : undefined,
    ageBand: typeof ageBandRaw === "string" && ageBandRaw ? ageBandRaw : undefined,
  });
}

export type FormState = { error?: string } | undefined;

export async function createChild(_prevState: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();

  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const membership = await getPrimaryOrganizationMembership(user.id);
  if (!membership) {
    return { error: "Organisasi tidak ditemukan." };
  }

  await db.child.create({
    data: {
      organizationId: membership.organizationId,
      parentUserId: user.id,
      displayName: parsed.data.displayName,
      avatarUrl: parsed.data.avatarUrl,
      ageBand: parsed.data.ageBand,
    },
  });

  revalidatePath("/parent");
  revalidatePath("/parent/children");
  redirect("/parent/children");
}

export async function updateChild(
  childId: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
  // Verifies childId actually belongs to this user (or their org, for
  // OWNER/ADMIN) before any write — the childId in the bound action comes
  // from a server-rendered link, but a request can still be forged directly.
  await requireChildAccess(user.id, childId);

  const parsed = parseChildForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await db.child.update({
    where: { id: childId },
    data: {
      displayName: parsed.data.displayName,
      avatarUrl: parsed.data.avatarUrl,
      ageBand: parsed.data.ageBand,
    },
  });

  revalidatePath("/parent");
  revalidatePath(`/parent/children/${childId}`);
  redirect("/parent/children");
}

export async function setActiveChild(childId: string) {
  const user = await requireUser();
  await requireChildAccess(user.id, childId);

  const cookieStore = await cookies();
  cookieStore.set("activeChildId", childId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  redirect("/parent");
}
