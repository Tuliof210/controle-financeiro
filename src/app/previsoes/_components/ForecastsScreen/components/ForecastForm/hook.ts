import type { EntryFormBase } from "@/components/EntryForm/entry-form.helper";
import { useEntryForm } from "@/components/EntryForm/entry-form.hook";
import type { Person } from "@/core/entities/person.entity";
import { intervalsToMonths } from "./intervals.helper";
import { useForecastIntervals } from "./intervals.hook";

export type ForecastFormValues = EntryFormBase & { months: number[] };

export type ForecastFormProps = {
  initial?: Partial<ForecastFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: ForecastFormValues) => void;
  people: Person[];
};

export function useForecastForm({
  initial,
  people,
  onSubmit,
}: Pick<ForecastFormProps, "initial" | "people" | "onSubmit">) {
  const entry = useEntryForm(initial, people);
  const { intervals, updateInterval, addInterval, removeInterval } =
    useForecastIntervals(initial?.months);

  const selectedMonths = intervalsToMonths(intervals);
  const canSubmit = entry.isValid && selectedMonths.length >= 1;

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
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    canSubmit,
    handleSubmit,
  };
}
