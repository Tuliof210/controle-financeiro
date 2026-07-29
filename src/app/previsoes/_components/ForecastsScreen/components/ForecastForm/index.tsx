"use client";

import { EntryForm } from "@/components/EntryForm";
import { IntervalList } from "./components/IntervalList";
import { type ForecastFormProps, useForecastForm } from "./hook";

export function ForecastForm(props: ForecastFormProps) {
  const { error, submitLabel, people } = props;
  const {
    fields,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    localError,
    canSubmit,
    handleSubmit,
  } = useForecastForm(props);

  return (
    <EntryForm
      idPrefix="forecast"
      people={people}
      fields={fields}
      period={
        <IntervalList
          intervals={intervals}
          onUpdate={updateInterval}
          onAdd={addInterval}
          onRemove={removeInterval}
        />
      }
      error={localError ?? error}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
    />
  );
}
