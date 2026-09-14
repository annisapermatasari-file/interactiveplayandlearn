"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AvatarPicker } from "@/components/child/AvatarPicker";
import { AGE_BAND_OPTIONS } from "@/lib/childOptions";
import type { FormState } from "@/server/actions/children";

type ChildFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function ChildForm({
  action,
  submitLabel,
  defaultValues,
}: {
  action: ChildFormAction;
  submitLabel: string;
  defaultValues?: {
    displayName?: string;
    avatarUrl?: string | null;
    ageBand?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <label htmlFor="displayName" className="text-sm font-medium">
          Nama Panggilan
        </label>
        <Input
          id="displayName"
          name="displayName"
          defaultValue={defaultValues?.displayName}
          maxLength={50}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Avatar</span>
        <AvatarPicker defaultValue={defaultValues?.avatarUrl ?? undefined} />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Kelompok Usia (opsional)</legend>
        <div className="flex flex-wrap gap-2">
          {AGE_BAND_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/5"
            >
              <input
                type="radio"
                name="ageBand"
                value={option.value}
                defaultChecked={defaultValues?.ageBand === option.value}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
