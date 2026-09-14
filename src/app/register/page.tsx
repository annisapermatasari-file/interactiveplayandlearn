import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";

export default function RegisterPage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Daftar</h1>
        <p className="mt-1 text-sm text-muted">Buat akun untuk mulai mendampingi anak belajar.</p>
        <div className="mt-6">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-muted">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary underline">
            Masuk
          </Link>
        </p>
      </Card>
    </main>
  );
}
