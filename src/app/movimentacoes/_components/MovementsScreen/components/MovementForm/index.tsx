"use client";

import { EntryForm } from "@/components/EntryForm";
import { SelectField } from "@/components/SelectField";
import { formatYyyymm } from "@/lib/months";
import { type MovementFormProps, useMovementForm } from "./hook";

export function MovementForm(props: MovementFormProps) {
  const { error, submitLabel, people, period } = props;
  const {
    fields,
    month,
    setMonth,
    monthOptions,
    localError,
    canSubmit,
    handleSubmit,
  } = useMovementForm(props);

  return (
    <EntryForm
      idPrefix="movement"
      people={people}
      fields={fields}
      period={
        period ? (
          <SelectField
            id="movement-month"
            label="Mês"
            value={String(month)}
            onChange={(next) => setMonth(Number(next))}
            options={monthOptions.map((option) => ({
              value: String(option),
              label: formatYyyymm(option),
            }))}
          />
        ) : null
      }
      guard="Defina o período global em Configurações para cadastrar movimentações."
      error={localError ?? error}
      submitLabel={submitLabel}
      canSubmit={canSubmit}
      onSubmit={handleSubmit}
    />
  );
}
