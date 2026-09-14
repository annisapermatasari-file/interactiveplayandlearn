import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createChild } from "@/server/actions/children";
import { ChildForm } from "@/components/child/ChildForm";
import { ChildCard } from "@/components/child/ChildCard";
import { Card } from "@/components/ui/Card";

export default async function ChildrenPage() {
  const session = await auth();
  if (!session?.user) return null;

  const children = await db.child.findMany({
    where: { parentUserId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div>
        <Link href="/parent" className="text-sm text-muted underline">
          ← Kembali ke Dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Profil Anak</h1>
      </div>

      {children.length > 0 ? (
        <div className="flex flex-col gap-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} href={`/parent/children/${child.id}`} />
          ))}
        </div>
      ) : null}

      <Card>
        <h2 className="text-lg font-semibold">Tambah Profil Anak</h2>
        <div className="mt-4">
          <ChildForm action={createChild} submitLabel="Simpan" />
        </div>
      </Card>
    </main>
  );
}
