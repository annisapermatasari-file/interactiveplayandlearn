"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/server/actions/teacher";

type AddChildFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function AddChildForm({
  action,
  availableChildren,
}: {
  action: AddChildFormAction;
  availableChildren: { id: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  const selectId = useId();

  if (availableChildren.length === 0) {
    return <p className="text-sm text-muted">Tidak ada anak lain di organisasi ini untuk ditambahkan.</p>;
  }

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={selectId} className="text-sm font-medium">
          Tambah Murid
        </label>
        <select
          id={selectId}
          name="childId"
          className="h-11 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {availableChildren.map((child) => (
            <option key={child.id} value={child.id}>
              {child.displayName}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : "Tambah"}
      </Button>
      {state?.error ? <p className="w-full text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}
