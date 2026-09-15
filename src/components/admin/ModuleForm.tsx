"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusSelect } from "@/components/admin/StatusSelect";
import type { FormState } from "@/server/actions/admin";

type ModuleFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function ModuleForm({
  action,
  submitLabel,
  defaultValues,
  showStatus,
}: {
  action: ModuleFormAction;
  submitLabel: string;
  defaultValues?: { title?: string; status?: string };
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  // A course page renders one ModuleForm per module plus an "add module"
  // form, so ids must be unique per instance.
  const formId = useId();
  const titleId = `${formId}-title`;
  const statusId = `${formId}-status`;

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-1 flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          Judul Modul
        </label>
        <Input id={titleId} name="title" defaultValue={defaultValues?.title} required maxLength={150} />
      </div>
      {showStatus ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={statusId} className="text-sm font-medium">
            Status
          </label>
          <StatusSelect id={statusId} defaultValue={defaultValues?.status ?? "DRAFT"} />
        </div>
      ) : null}
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "..." : submitLabel}
      </Button>
      {state?.error ? <p className="w-full text-sm text-danger">{state.error}</p> : null}
    </form>
  );
}
