"use client";

import { EntryForm } from "@/components/EntryForm";
import { MonthPicker } from "@/components/MonthPicker";
import { type MovementFormProps, useMovementForm } from "./hook";

export function MovementForm(props: MovementFormProps) {
  const { error, submitLabel, people } = props;
  const { fields, month, setMonth, localError, canSubmit, handleSubmit } =
    useMovementForm(props);

  return (
    <EntryForm
      idPrefix="movement"
      people={people}
      fields={fields}
      period={
        <MonthPicker
          id="movement-month"
          label="Mês"
          value={month}
          onChange={setMonth}
        />
      }
      error={localError ?? error}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
    />
  );
}
