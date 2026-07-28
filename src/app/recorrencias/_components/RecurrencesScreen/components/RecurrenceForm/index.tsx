"use client";

import { EntryForm } from "@/components/EntryForm";
import { IntervalList } from "./components/IntervalList";
import { type RecurrenceFormProps, useRecurrenceForm } from "./hook";

export function RecurrenceForm(props: RecurrenceFormProps) {
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
  } = useRecurrenceForm(props);

  return (
    <EntryForm
      idPrefix="recurrence"
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
