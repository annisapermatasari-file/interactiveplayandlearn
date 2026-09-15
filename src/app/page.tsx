import Link from "next/link";
import { auth } from "@/lib/auth";
import { buttonClasses } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ACTIVITY_TYPE_LABELS, SKILL_LABELS } from "@/lib/labels";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Daftar sebagai orang tua atau guru",
    body: "Buat akun dalam satu langkah — tidak perlu kartu kredit, tidak perlu menunggu persetujuan.",
  },
  {
    step: "2",
    title: "Tambahkan profil anak",
    body: "Setiap anak punya profil, jenjang usia, dan progres sendiri — bisa lebih dari satu anak dalam satu akun.",
  },
  {
    step: "3",
    title: "Anak mengerjakan aktivitas berhitung",
    body: "Soal interaktif dengan gambar, bukan teks — cocok untuk anak yang belum lancar membaca.",
  },
  {
    step: "4",
    title: "Pantau progres, XP, dan lencana",
    body: "Setiap jawaban dinilai di server — orang tua melihat kemajuan nyata, bukan sekadar status selesai.",
  },
] as const;

const FEATURES = [
  {
    title: "Skor & XP tervalidasi server",
    body: "Kebenaran jawaban dan poin XP dihitung di server, bukan di browser anak — tidak bisa dicurangi.",
  },
  {
    title: "Beragam jenis aktivitas",
    body: `${ACTIVITY_TYPE_LABELS.COUNT_SELECT}, ${ACTIVITY_TYPE_LABELS.COUNT_CIRCLE}, ${ACTIVITY_TYPE_LABELS.DRAG_MATCH}, dan ${ACTIVITY_TYPE_LABELS.TRACE_NUMBER} — semua dibangun dari konten yang sama, tanpa hardcode.`,
  },
  {
    title: "Progres per keterampilan",
    body: `Dilacak per kemampuan seperti "${SKILL_LABELS.COUNT_1_10}" dan "${SKILL_LABELS.NUMBER_RECOGNITION_1_10}", bukan cuma nilai akhir.`,
  },
  {
    title: "Untuk keluarga & kelas",
    body: "Satu anak, banyak anak, atau satu kelas penuh murid — arsitektur yang sama melayani orang tua dan guru.",
  },
] as const;

export default async function HomePage() {
  const session = await auth();

  return (
    <>
      <header className="material sticky top-0 z-10 border-b border-border">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <span className="font-semibold tracking-tight">Counting LMS</span>
          {session?.user ? (
            <Link href="/parent" className={buttonClasses({ size: "sm" })}>
              Buka Dashboard
            </Link>
          ) : (
            <div className="flex gap-2">
              <Link href="/login" className={buttonClasses({ size: "sm", variant: "ghost" })}>
                Masuk
              </Link>
              <Link href="/register" className={buttonClasses({ size: "sm" })}>
                Daftar
              </Link>
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 px-6 py-20 text-center sm:py-28">
          <span className="rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted">
            Untuk anak usia dini · Berhitung & mengenal angka
          </span>
          <h1 className="text-display max-w-2xl text-4xl font-semibold sm:text-6xl">
            Belajar berhitung yang terasa seperti bermain
          </h1>
          <p className="max-w-xl text-lg text-muted">
            Platform belajar berhitung interaktif untuk anak usia dini — soal
            bergambar, skor dan XP yang tervalidasi server, serta progres yang
            bisa dipantau orang tua dan guru secara real time.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {session?.user ? (
              <Link href="/parent" className={buttonClasses({ size: "lg" })}>
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link href="/register" className={buttonClasses({ size: "lg" })}>
                  Mulai Gratis
                </Link>
                <Link href="/login" className={buttonClasses({ size: "lg", variant: "ghost" })}>
                  Masuk
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Example content: a mock of what the child actually sees */}
        <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">Contoh tampilan aktivitas</h2>
            <p className="mx-auto mt-2 max-w-md text-muted">
              Pratinjau — bukan tangkapan layar langsung, tapi persis seperti
              yang akan dikerjakan anak Anda.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Activity mock */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {ACTIVITY_TYPE_LABELS.COUNT_SELECT}
                </span>
                <span className="text-xs text-muted">{SKILL_LABELS.COUNT_1_10}</span>
              </div>

              <p className="text-lg font-medium">Berapa banyak apel di bawah ini?</p>
              <p aria-hidden className="text-4xl leading-none tracking-widest">
                🍎🍎🍎🍎
              </p>

              <div className="grid grid-cols-3 gap-3" aria-hidden>
                <div className="rounded-xl border border-border bg-background py-3 text-center font-medium text-muted transition-transform duration-150 ease-[var(--spring-out)] hover:scale-[1.03]">
                  3
                </div>
                <div className="rounded-xl border-2 border-success bg-success/10 py-3 text-center font-semibold text-success transition-transform duration-150 ease-[var(--spring-press)] hover:scale-[1.03]">
                  4
                </div>
                <div className="rounded-xl border border-border bg-background py-3 text-center font-medium text-muted transition-transform duration-150 ease-[var(--spring-out)] hover:scale-[1.03]">
                  5
                </div>
              </div>
              <p className="text-center text-sm text-success">Benar! +10 XP</p>
            </Card>

            {/* Progress mock */}
            <Card className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">Progres Rara</p>
                <span className="rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
                  Level 3 · 120 XP
                </span>
              </div>

              {(
                [
                  { label: SKILL_LABELS.COUNT_1_10, value: 80 },
                  { label: SKILL_LABELS.NUMBER_RECOGNITION_1_10, value: 55 },
                  { label: SKILL_LABELS.MATCH_QUANTITY, value: 30 },
                ] as const
              ).map((row) => (
                <div key={row.label} className="flex flex-col gap-1" aria-hidden>
                  <div className="flex justify-between text-sm">
                    <span>{row.label}</span>
                    <span className="text-muted">{row.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <p className="text-sm text-muted">
                Data ini dihitung ulang dari riwayat pengerjaan anak, bukan
                sekadar counter yang bisa meleset saat submit ganda.
              </p>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-5xl px-6 py-12">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Cara pakai</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="flex flex-col gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {item.step}
                </span>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto w-full max-w-5xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                className="transition-transform duration-200 ease-[var(--spring-out)] hover:-translate-y-0.5"
              >
                <p className="font-medium">{feature.title}</p>
                <p className="mt-1 text-sm text-muted">{feature.body}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="px-6 py-16 text-center">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-4">
            <h2 className="text-2xl font-semibold sm:text-3xl">Siap dicoba?</h2>
            <p className="text-muted">
              Daftar gratis, tambahkan profil anak, dan lihat aktivitas
              pertamanya dalam hitungan menit.
            </p>
            {session?.user ? (
              <Link href="/parent" className={buttonClasses({ size: "lg" })}>
                Buka Dashboard
              </Link>
            ) : (
              <Link href="/register" className={buttonClasses({ size: "lg" })}>
                Mulai Gratis
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted">
        Counting LMS — belajar berhitung untuk anak usia dini.
      </footer>
    </>
  );
}
