import { auth } from "@/lib/auth";
import { logout } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function ParentDashboardPage() {
  // Middleware (src/middleware.ts) already blocks unauthenticated requests
  // to this route; this call is defense in depth, not the primary guard.
  const session = await auth();
  if (!session?.user) return null;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <Card>
        <h1 className="text-2xl font-semibold">Halo, {session.user.name}!</h1>
        <p className="mt-1 text-sm text-muted">{session.user.email}</p>
      </Card>
      <p className="text-sm text-muted">
        Profil anak dan progres belajar akan tersedia pada fase berikutnya.
      </p>
      <form action={logout}>
        <Button type="submit" variant="ghost">
          Keluar
        </Button>
      </form>
    </main>
  );
}
