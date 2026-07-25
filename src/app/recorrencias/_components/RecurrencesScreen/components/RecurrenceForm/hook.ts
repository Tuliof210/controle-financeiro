import type { EntryFormBase } from "@/components/EntryForm/hook";
import { useEntryForm } from "@/components/EntryForm/hook";
import type { Person } from "@/core/entities/person.entity";
import { buildMonths } from "@/lib/months";
import { intervalsToMonths } from "./intervals.helper";
import { useRecurrenceIntervals } from "./intervals.hook";

export type RecurrenceFormValues = EntryFormBase & { months: number[] };

export type RecurrenceFormProps = {
  initial?: Partial<RecurrenceFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: RecurrenceFormValues) => void;
  people: Person[];
  period: { start: number; end: number } | null;
};

export function useRecurrenceForm({
  initial,
  people,
  period,
  onSubmit,
}: Pick<RecurrenceFormProps, "initial" | "people" | "period" | "onSubmit">) {
  const entry = useEntryForm(initial, people);
  const { intervals, updateInterval, addInterval, removeInterval } =
    useRecurrenceIntervals(initial?.months, period);

  const months = period ? buildMonths(period.start, period.end) : [];
  const selectedMonths = intervalsToMonths(intervals);

  const canSubmit =
    period !== null && entry.isValid && selectedMonths.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) {
      entry.setLocalError("Preencha nome, valor e responsável corretamente");
      return;
    }
    entry.setLocalError(undefined);
    onSubmit({ ...entry.base(), months: selectedMonths });
  };

  return {
    fields: entry.fields,
    localError: entry.localError,
    months,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    canSubmit,
    handleSubmit,
  };
}
