"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { ACTIVITY_TYPE_LABELS } from "@/lib/labels";
import type { FormState } from "@/server/actions/admin";
import type { ActivityType } from "@/generated/prisma/client";

type ActivityFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;

const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Pemula" },
  { value: "EASY", label: "Mudah" },
  { value: "MEDIUM", label: "Sedang" },
  { value: "HARD", label: "Sulit" },
];

export function ActivityForm({
  action,
  submitLabel,
  defaultValues,
  showType,
  showStatus,
}: {
  action: ActivityFormAction;
  submitLabel: string;
  defaultValues?: { type?: ActivityType; title?: string; difficulty?: string; status?: string };
  showType?: boolean;
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  // A lesson page renders one ActivityForm per activity plus an "add
  // activity" form, so ids must be unique per instance.
  const formId = useId();
  const typeId = `${formId}-type`;
  const titleId = `${formId}-title`;
  const difficultyId = `${formId}-difficulty`;
  const statusId = `${formId}-status`;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {showType ? (
        <div className="flex flex-col gap-1">
          <label htmlFor={typeId} className="text-sm font-medium">
            Tipe Aktivitas
          </label>
          <select
            id={typeId}
            name="type"
            defaultValue={defaultValues?.type ?? "COUNT_SELECT"}
            className="h-11 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {(Object.entries(ACTIVITY_TYPE_LABELS) as [ActivityType, string][]).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <label htmlFor={titleId} className="text-sm font-medium">
          Judul Aktivitas
        </label>
        <Input id={titleId} name="title" defaultValue={defaultValues?.title} required maxLength={150} />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor={difficultyId} className="text-sm font-medium">
          Tingkat Kesulitan
        </label>
        <select
          id={difficultyId}
          name="difficulty"
          defaultValue={defaultValues?.difficulty ?? "EASY"}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {DIFFICULTY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
