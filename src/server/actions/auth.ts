"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { signIn, signOut } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi.").max(100),
  email: z.email("Email tidak valid."),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

export type FormState = { error?: string } | undefined;

export async function registerParent(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email sudah terdaftar." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { name, email, passwordHash } });
    const organization = await tx.organization.create({
      data: { name: `Keluarga ${name}`, type: "INDIVIDUAL" },
    });
    await tx.organizationMember.create({
      data: { organizationId: organization.id, userId: user.id, role: "OWNER" },
    });
    await tx.subscription.create({
      data: { organizationId: organization.id, plan: "FREE", status: "ACTIVE" },
    });
  });

  redirect("/login?registered=1");
}

const loginSchema = z.object({
  email: z.email("Email tidak valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export async function loginParent(_prevState: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const callbackUrl = formData.get("callbackUrl");
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/parent",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Email atau kata sandi salah." };
    }
    // NEXT_REDIRECT (thrown by a successful signIn) must propagate.
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}
