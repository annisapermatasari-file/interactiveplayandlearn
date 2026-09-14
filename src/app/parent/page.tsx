import Link from "next/link";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logout } from "@/server/actions/auth";
import { setActiveChild } from "@/server/actions/children";
import { Button, buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChildCard } from "@/components/child/ChildCard";

export default async function ParentDashboardPage() {
  // Middleware (src/proxy.ts) already blocks unauthenticated requests to
  // this route; this call is defense in depth, not the primary guard.
  const session = await auth();
  if (!session?.user) return null;

  const [children, cookieStore] = await Promise.all([
    db.child.findMany({
      where: { parentUserId: session.user.id },
      orderBy: { createdAt: "asc" },
    }),
    cookies(),
  ]);
  const activeChildId = cookieStore.get("activeChildId")?.value;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Halo, {session.user.name}!</h1>
        <p className="mt-1 text-sm text-muted">{session.user.email}</p>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Profil Anak</h2>
          <Link href="/parent/children" className={buttonClasses({ size: "sm", variant: "ghost" })}>
            Kelola Profil
          </Link>
        </div>

        {children.length === 0 ? (
          <Card>
            <p className="text-sm text-muted">
              Belum ada profil anak. Tambahkan profil pertama untuk mulai belajar.
            </p>
            <Link href="/parent/children" className={buttonClasses({ className: "mt-4" })}>
              Tambah Profil Anak
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3">
                <div className="flex-1">
                  <ChildCard child={child} isActive={child.id === activeChildId} />
                </div>
                <Link href={`/parent/children/${child.id}/progress`} className="text-sm text-primary underline">
                  Progres
                </Link>
                {child.id === activeChildId ? (
                  <span className="text-sm font-medium text-success">Aktif</span>
                ) : (
                  <form action={setActiveChild.bind(null, child.id)}>
                    <Button type="submit" size="sm" variant="ghost">
                      Pilih
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {activeChildId ? (
        <Link href="/learn" className={buttonClasses({ className: "self-start" })}>
          Buka Halaman Belajar
        </Link>
      ) : (
        <p className="text-sm text-muted">Pilih salah satu profil anak di atas untuk mulai belajar.</p>
      )}

      <form action={logout}>
        <Button type="submit" variant="ghost">
          Keluar
        </Button>
      </form>
    </main>
  );
}
