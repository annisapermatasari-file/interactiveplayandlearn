import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser, requireChildAccess, ForbiddenError } from "@/lib/permissions";
import { updateChild } from "@/server/actions/children";
import { ChildForm } from "@/components/child/ChildForm";
import { Card } from "@/components/ui/Card";

export default async function ChildDetailPage({ params }: PageProps<"/parent/children/[childId]">) {
  const { childId } = await params;
  const user = await requireUser();

  const child = await requireChildAccess(user.id, childId).catch((error) => {
    if (error instanceof ForbiddenError) return null;
    throw error;
  });
  if (!child) notFound();

  const updateChildWithId = updateChild.bind(null, childId);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <div>
        <Link href="/parent/children" className="text-sm text-muted underline">
          ← Kembali
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Edit Profil: {child.displayName}</h1>
      </div>
      <Card>
        <ChildForm
          action={updateChildWithId}
          submitLabel="Simpan Perubahan"
          defaultValues={{
            displayName: child.displayName,
            avatarUrl: child.avatarUrl,
            ageBand: child.ageBand ?? undefined,
          }}
        />
      </Card>
    </main>
  );
}
