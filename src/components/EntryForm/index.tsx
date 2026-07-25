"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { SelectField } from "@/components/SelectField";
import { TextField } from "@/components/TextField";
import type { Person } from "@/core/entities/person.entity";
import { ENTRY_TYPES, SELECTED_VARIANT, TYPE_LABELS } from "@/lib/entry-types";
import type { EntryFormBase } from "./hook";
import styles from "./style.module.scss";

export type EntryFormFields = EntryFormBase & {
  setName: (value: string) => void;
  setValueCents: (value: number) => void;
  setType: (value: EntryFormBase["type"]) => void;
  setOwnerId: (value: string) => void;
};

export type EntryFormProps = {
  // Prefixes the field ids, e.g. "recurrence" -> "recurrence-name".
  idPrefix: string;
  people: Person[];
  fields: EntryFormFields;
  // The entity's own period control, or null when there is no global period —
  // the one part of the form that genuinely differs, so the caller renders it.
  period: ReactNode | null;
  guard: string;
  error?: string;
  submitLabel: string;
  canSubmit: boolean;
  onSubmit: () => void;
};

export function EntryForm({
  idPrefix,
  people,
  fields,
  period,
  guard,
  error,
  submitLabel,
  canSubmit,
  onSubmit,
}: EntryFormProps) {
  const { name, setName, valueCents, setValueCents, type, setType } = fields;

  return (
    <div className={styles.form}>
      <TextField
        id={`${idPrefix}-name`}
        label="Nome"
        value={name}
        onChange={setName}
      />
      <MoneyInput
        valueCents={valueCents}
        onChange={setValueCents}
        ariaLabel="Valor"
      />
      <div className={styles.typeToggle}>
        {ENTRY_TYPES.map((kind) => (
          <Button
            key={kind}
            variant={type === kind ? SELECTED_VARIANT[kind] : "ghost"}
            onClick={() => setType(kind)}
          >
            {TYPE_LABELS[kind]}
          </Button>
        ))}
      </div>
      <SelectField
        id={`${idPrefix}-owner`}
        label="Responsável"
        value={fields.ownerId}
        onChange={fields.setOwnerId}
        options={people.map((person) => ({
          value: person.id,
          label: person.name,
        }))}
      />
      {period ?? <p className={styles.guard}>{guard}</p>}
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
      <Button onClick={onSubmit} disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
