import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default async function HomePage() {
  const session = await auth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted">
          Sedang dibangun · Autentikasi &amp; profil orang tua
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Counting LMS
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Platform belajar berhitung interaktif untuk anak usia dini — dari
          latihan berhitung sederhana menuju perjalanan belajar yang
          terstruktur, dengan skor, XP, dan progres yang tervalidasi server.
        </p>
      </div>

      <div className="flex gap-3">
        {session?.user ? (
          <Link href="/parent" className={buttonClasses({ size: "lg" })}>
            Buka Dashboard
          </Link>
        ) : (
          <>
            <Link href="/login" className={buttonClasses({ size: "lg" })}>
              Masuk
            </Link>
            <Link href="/register" className={buttonClasses({ size: "lg", variant: "ghost" })}>
              Daftar
            </Link>
          </>
        )}
      </div>

      <Card className="max-w-xl text-left">
        <p className="text-sm text-muted">
          Fondasi aplikasi, basis data, dan autentikasi telah disiapkan. Profil
          anak dan modul pembelajaran akan dibangun pada fase-fase berikutnya.
        </p>
      </Card>
    </main>
  );
}
