import "server-only";
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
 * Verifies the signed-in user may access a given child: either they are the
 * child's registered parent, or they hold an OWNER/ADMIN membership in the
 * child's organization. This is the check every child-scoped read or
 * mutation must call — it is what stops one parent from reaching another
 * family's child by guessing/passing a different childId.
 */
export async function requireChildAccess(userId: string, childId: string) {
  const child = await db.child.findUnique({
    where: { id: childId },
    select: { id: true, organizationId: true, parentUserId: true },
  });
  if (!child) throw new ForbiddenError("Child not found.");

  if (child.parentUserId === userId) return child;

  const membership = await getOrganizationMembership(userId, child.organizationId);
  if (membership && (membership.role === "OWNER" || membership.role === "ADMIN")) {
    return child;
  }

  throw new ForbiddenError("You do not have access to this child.");
}
