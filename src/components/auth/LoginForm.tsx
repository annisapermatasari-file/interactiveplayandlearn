"use client";

import { useActionState } from "react";
import { loginParent, type FormState } from "@/server/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: FormState = undefined;

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(loginParent, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Kata Sandi
        </label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Masuk..." : "Masuk"}
      </Button>
    </form>
  );
}
