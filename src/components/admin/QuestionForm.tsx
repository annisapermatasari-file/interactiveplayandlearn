"use client";

import { useActionState, useId } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusSelect } from "@/components/admin/StatusSelect";
import { SKILL_LABELS } from "@/lib/labels";
import type { FormState } from "@/server/actions/admin";
import type { Skill } from "@/generated/prisma/client";

type QuestionFormAction = (prevState: FormState, formData: FormData) => Promise<FormState>;
type QuestionOption = { id: string; label: string };

export function QuestionForm({
  action,
  submitLabel,
  defaultValues,
  showStatus,
}: {
  action: QuestionFormAction;
  submitLabel: string;
  defaultValues?: {
    skill?: Skill;
    prompt?: string;
    status?: string;
    options?: QuestionOption[] | null;
    correctOptionId?: string;
  };
  showStatus?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, undefined);
  // A lesson page renders one "add question" QuestionForm per activity, so
  // element ids must be unique per instance. The "correctOption" radio name
  // can stay as-is: radio grouping is scoped to each <form>, so same-named
  // radios in different form instances don't interfere with each other.
  const formId = useId();
  const promptId = `${formId}-prompt`;
  const skillId = `${formId}-skill`;
  const statusId = `${formId}-status`;

  const options = defaultValues?.options ?? [];
  const correctSlot = options.findIndex((option) => option.id === defaultValues?.correctOptionId) + 1 || 1;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor={promptId} className="text-sm font-medium">
          Pertanyaan (gunakan emoji untuk visual, mis. 🍎🍎🍎)
        </label>
        <textarea
          id={promptId}
          name="prompt"
          defaultValue={defaultValues?.prompt}
          required
          rows={2}
          maxLength={500}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={skillId} className="text-sm font-medium">
          Keterampilan
        </label>
        <select
          id={skillId}
          name="skill"
          defaultValue={defaultValues?.skill ?? "COUNT_1_10"}
          className="h-11 rounded-lg border border-border bg-surface px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {(Object.entries(SKILL_LABELS) as [Skill, string][]).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">
          Pilihan Jawaban (isi minimal 2, tandai jawaban yang benar)
        </legend>
        {[1, 2, 3, 4].map((slot) => {
          const optionInputId = `${formId}-option-${slot}`;
          return (
            <div key={slot} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                value={slot}
                defaultChecked={slot === correctSlot}
                aria-label={`Tandai pilihan ${slot} sebagai jawaban benar`}
                id={`${formId}-correct-${slot}`}
              />
              <label htmlFor={optionInputId} className="sr-only">
                {`Pilihan ${slot}`}
              </label>
              <Input
                id={optionInputId}
                name={`option${slot}`}
                defaultValue={options[slot - 1]?.label}
                placeholder={`Pilihan ${slot}${slot > 2 ? " (opsional)" : ""}`}
                maxLength={50}
                className="flex-1"
              />
            </div>
          );
        })}
      </fieldset>

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
