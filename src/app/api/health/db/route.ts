import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const rows = await db.$queryRaw<Array<{ users_table: string | null; organizations_table: string | null; members_table: string | null; subscriptions_table: string | null }>>`
      SELECT
        to_regclass('public.users')::text AS users_table,
        to_regclass('public.organizations')::text AS organizations_table,
        to_regclass('public.organization_members')::text AS members_table,
        to_regclass('public.subscriptions')::text AS subscriptions_table
    `;
    const tables = rows[0];
    const ok = Boolean(
      tables?.users_table &&
        tables.organizations_table &&
        tables.members_table &&
        tables.subscriptions_table,
    );

    return NextResponse.json({ ok, tables }, { status: ok ? 200 : 503 });
  } catch (error) {
    console.error("Database health check failed", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
