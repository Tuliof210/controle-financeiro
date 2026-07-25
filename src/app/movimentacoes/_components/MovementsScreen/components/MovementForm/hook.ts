import { useState } from "react";
import type { EntryFormBase } from "@/components/EntryForm/hook";
import { useEntryForm } from "@/components/EntryForm/hook";
import type { Person } from "@/core/entities/person.entity";
import { buildMonths, currentYYYYMM } from "@/lib/months";

export type MovementFormValues = EntryFormBase & { month: number };

export type MovementFormProps = {
  initial?: Partial<MovementFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: MovementFormValues) => void;
  people: Person[];
  period: { start: number; end: number } | null;
};

export function useMovementForm({
  initial,
  people,
  period,
  onSubmit,
}: Pick<MovementFormProps, "initial" | "people" | "period" | "onSubmit">) {
  const entry = useEntryForm(initial, people);

  // Default to the current month, clamped into the period (YYYYMM is monotonic
  // as an int, so min/max clamps correctly); 0 when there is no period.
  const defaultMonth = period
    ? Math.min(Math.max(currentYYYYMM(), period.start), period.end)
    : 0;
  const [month, setMonth] = useState(initial?.month ?? defaultMonth);

  const monthOptions = period ? buildMonths(period.start, period.end) : [];

  const canSubmit =
    period !== null && entry.isValid && monthOptions.includes(month);

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
    monthOptions,
    canSubmit,
    handleSubmit,
  };
}
