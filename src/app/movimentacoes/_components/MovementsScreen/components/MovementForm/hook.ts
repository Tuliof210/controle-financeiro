import { useState } from "react";
import type { EntryFormBase } from "@/components/EntryForm/entry-form.helper.ts";
import { useEntryForm } from "@/components/EntryForm/entry-form.hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { currentYYYYMM } from "@/lib/months.ts";

export type MovementFormValues = EntryFormBase & { month: number };

export type MovementFormProps = {
  initial?: Partial<MovementFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: MovementFormValues) => void;
  people: Person[];
};

export function useMovementForm({
  initial,
  people,
  onSubmit,
}: Pick<MovementFormProps, "initial" | "people" | "onSubmit">) {
  const entry = useEntryForm(initial, people);

  // No period to default into any more — the current month is always a valid
  // pick, and MonthPicker needs a non-null value from the first render.
  const [month, setMonth] = useState(initial?.month ?? currentYYYYMM());

  const canSubmit = entry.isValid;

  const handleSubmit = () => {
    if (!canSubmit) {
      entry.setLocalError("Preencha nome, valor e responsável corretamente");
      return;
    }
    entry.setLocalError(undefined);
    onSubmit({ ...entry.base(), month });
  };

  return {
    fields: entry.fields,
    localError: entry.localError,
    month,
    setMonth,
    canSubmit,
    handleSubmit,
  };
}
