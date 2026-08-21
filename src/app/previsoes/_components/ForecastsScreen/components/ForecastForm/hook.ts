import { useState } from "react";
import type { EntryFormBase } from "@/components/EntryForm/entry-form.helper.ts";
import { useEntryForm } from "@/components/EntryForm/entry-form.hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import {
  DEFAULT_FORECAST_KIND,
  type ForecastKind,
} from "@/lib/forecast-kinds.ts";
import { intervalsToMonths } from "./intervals.helper.ts";
import { useForecastIntervals } from "./intervals.hook.ts";

export type ForecastFormValues = EntryFormBase & {
  months: number[];
  simulated: boolean;
  kind: ForecastKind;
};

export interface ForecastFormProps {
  initial?: Partial<ForecastFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: ForecastFormValues) => void;
  people: Person[];
}

export function useForecastForm({
  initial,
  people,
  onSubmit,
}: Pick<ForecastFormProps, "initial" | "people" | "onSubmit">) {
  const entry = useEntryForm(initial, people);
  const { intervals, updateInterval, addInterval, removeInterval } =
    useForecastIntervals(initial?.months);
  // Held here and not in useEntryForm: `simulated` and `kind` are a forecast's
  // own fields, the way `months` is. A movement already happened — it is
  // neither a simulation nor a classification of a plan.
  const [simulated, setSimulated] = useState(initial?.simulated ?? false);
  const [kind, setKind] = useState(initial?.kind ?? DEFAULT_FORECAST_KIND);

  const selectedMonths = intervalsToMonths(intervals);
  const canSubmit = entry.isValid && selectedMonths.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      entry.setLocalError("Preencha nome, valor e responsável corretamente");
      return;
    }
    entry.setLocalError(undefined);
    // entry.base() is typed exactly EntryFormBase, so it carries none of the
    // forecast's own fields through — they are merged here.
    onSubmit({ ...entry.base(), months: selectedMonths, simulated, kind });
  };

  return {
    fields: entry.fields,
    localError: entry.localError,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    simulated,
    toggleSimulated: () => setSimulated((value) => !value),
    kind,
    setKind,
    canSubmit,
    handleSubmit,
  };
}
