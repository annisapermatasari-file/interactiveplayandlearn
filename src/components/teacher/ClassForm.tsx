"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { FormState } from "@/server/actions/teacher";

type ClassFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function ClassForm({ action, submitLabel }: { action: ClassFormAction; submitLabel: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const nameId = useId();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={nameId} className="text-sm font-medium">
          Nama Kelas
        </label>
        <Input id={nameId} name="name" required maxLength={150} placeholder="Kelas A" />
      </div>
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
