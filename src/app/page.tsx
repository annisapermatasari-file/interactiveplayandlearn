import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted">
          Sedang dibangun · Fondasi platform
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
        <Button size="lg">Masuk</Button>
        <Button size="lg" variant="ghost">
          Daftar
        </Button>
      </div>

      <Card className="max-w-xl text-left">
        <p className="text-sm text-muted">
          Fondasi aplikasi (Next.js, TypeScript, Tailwind) telah disiapkan.
          Basis data, autentikasi, dan modul pembelajaran akan dibangun pada
          fase-fase berikutnya.
        </p>
      </Card>
    </main>
  );
}
