import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/client";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "You do not have access to this resource.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Reads the session from the request/cookies. Throws if there is none. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user;
}

/** Always resolved fresh from the database — never trust a client-supplied organizationId. */
export async function getOrganizationMembership(userId: string, organizationId: string) {
  return db.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
}

/**
 * MVP assumption: each user belongs to exactly one organization (the one
 * created for them at registration). Once a user can belong to multiple
 * organizations (teachers, multi-org owners), callers should require an
 * explicit organizationId instead of relying on this.
 */
export async function getPrimaryOrganizationMembership(userId: string) {
  return db.organizationMember.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function requireOrganizationRole(
  userId: string,
  organizationId: string,
  allowedRoles: UserRole[],
) {
  const membership = await getOrganizationMembership(userId, organizationId);
  if (!membership || !allowedRoles.includes(membership.role)) {
    throw new ForbiddenError("You do not have access to this organization.");
  }
  return membership;
}

/**
 * Global content-admin check. Course/Module/Lesson/Activity/Question are
 * platform-wide content (no organizationId), so "who can manage content"
 * isn't an org-membership question the way child access is. There is no
 * platform-level SUPER_ADMIN concept yet (PRD marks it "future"), so this
 * is a deliberate MVP stand-in: true only for a user holding an ADMIN
 * membership somewhere. This is safe against privilege escalation because
 * self-registration (src/server/actions/auth.ts) always grants OWNER, never
 * ADMIN — a user can only ever reach ADMIN by being granted it directly
 * (e.g. via the seed data), not by registering an account. Replace with a
 * real platform-admin flag if/when multi-org admin scoping is needed.
 */
export async function requireGlobalAdmin(userId: string) {
  const membership = await db.organizationMember.findFirst({
    where: { userId, role: "ADMIN" },
  });
  if (!membership) throw new ForbiddenError("Admin access required.");
  return membership;
}

/**
 * Verifies the signed-in user may access a given child: either they are the
 * child's registered parent, or they hold an OWNER/ADMIN membership in the
 * child's organization. This is the check every child-scoped read or
 * mutation must call — it is what stops one parent from reaching another
 * family's child by guessing/passing a different childId.
 */
export async function requireChildAccess(userId: string, childId: string) {
  const child = await db.child.findUnique({ where: { id: childId } });
  if (!child) throw new ForbiddenError("Child not found.");

  if (child.parentUserId === userId) return child;

  const membership = await getOrganizationMembership(userId, child.organizationId);
  if (membership && (membership.role === "OWNER" || membership.role === "ADMIN")) {
    return child;
  }

  throw new ForbiddenError("You do not have access to this child.");
}

/**
 * Resolves the "active child" cookie set by setActiveChild (Phase 3),
 * re-validating ownership on every call. A stale or forged cookie (e.g. left
 * over after switching accounts) resolves to null rather than throwing —
 * callers should treat null as "no child selected", not as an error.
 */
export async function getActiveChild(userId: string) {
  const cookieStore = await cookies();
  const activeChildId = cookieStore.get("activeChildId")?.value;
  if (!activeChildId) return null;

  try {
    return await requireChildAccess(userId, activeChildId);
  } catch (error) {
    if (error instanceof ForbiddenError) return null;
    throw error;
  }
}

/** For pages that require both a signed-in user and a selected child (the /learn area). */
export async function requireActiveChild() {
  const user = await requireUser();
  const child = await getActiveChild(user.id);
  if (!child) redirect("/parent");
  return { user, child };
}
