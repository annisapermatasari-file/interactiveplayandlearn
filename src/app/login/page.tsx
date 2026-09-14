import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, registered } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Masuk</h1>
        <p className="mt-1 text-sm text-muted">Masuk untuk melanjutkan belajar.</p>
        {registered ? (
          <p className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            Akun berhasil dibuat. Silakan masuk.
          </p>
        ) : null}
        <div className="mt-6">
          <LoginForm callbackUrl={typeof callbackUrl === "string" ? callbackUrl : undefined} />
        </div>
        <p className="mt-6 text-sm text-muted">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary underline">
            Daftar
          </Link>
        </p>
      </Card>
    </main>
  );
}
