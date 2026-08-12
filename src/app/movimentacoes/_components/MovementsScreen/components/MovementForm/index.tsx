"use client";

import { EntryForm } from "@/components/EntryForm/index.tsx";
import { MonthPicker } from "@/components/MonthPicker/index.tsx";
import { type MovementFormProps, useMovementForm } from "./hook.ts";

const MONTH_ID = "movement-month";

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
          id={MONTH_ID}
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
