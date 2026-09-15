"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusSelect } from "@/components/admin/StatusSelect";
import type { FormState } from "@/server/actions/admin";

type CourseFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

export function CourseForm({
  action,
  submitLabel,
  defaultValues,
  showStatus,
}: {
  action: CourseFormAction;
  submitLabel: string;
  defaultValues?: { title?: string; description?: string | null; status?: string };
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  // Multiple instances of this form can render on one page (course +
  // per-module forms elsewhere), so ids must be unique per instance —
  // otherwise <label htmlFor> associates with the wrong element's control.
  const formId = useId();
  const titleId = `${formId}-title`;
  const descriptionId = `${formId}-description`;
  const statusId = `${formId}-status`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          Judul Kursus
        </label>
        <Input id={titleId} name="title" defaultValue={defaultValues?.title} required maxLength={150} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={descriptionId} className="text-sm font-medium">
          Deskripsi
        </label>
        <textarea
          id={descriptionId}
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          rows={3}
          maxLength={1000}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>
      {showStatus ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={statusId} className="text-sm font-medium">
            Status
          </label>
          <StatusSelect id={statusId} defaultValue={defaultValues?.status ?? "DRAFT"} />
        </div>
      ) : null}
      {state?.error ? <p className="text-sm text-danger">{state.error}</p> : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  );
}
