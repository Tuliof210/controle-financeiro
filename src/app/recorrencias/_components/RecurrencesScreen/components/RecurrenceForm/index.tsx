"use client";

import { EntryForm } from "@/components/EntryForm";
import { IntervalList } from "./components/IntervalList";
import { type RecurrenceFormProps, useRecurrenceForm } from "./hook";

export function RecurrenceForm(props: RecurrenceFormProps) {
  const { error, submitLabel, people, period } = props;
  const {
    fields,
    months,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    localError,
    canSubmit,
    handleSubmit,
  } = useRecurrenceForm(props);

  return (
    <EntryForm
      idPrefix="recurrence"
      people={people}
      fields={fields}
      period={
        period ? (
          <IntervalList
            months={months}
            intervals={intervals}
            onUpdate={updateInterval}
            onAdd={addInterval}
            onRemove={removeInterval}
          />
        ) : null
      }
      guard="Defina o período global em Configurações para cadastrar recorrências."
      error={localError ?? error}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
    />
  );
}
