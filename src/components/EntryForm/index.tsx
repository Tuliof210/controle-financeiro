"use client";

import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { SelectField } from "@/components/SelectField/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import {
  ENTRY_TYPES,
  SELECTED_VARIANT,
  TYPE_LABELS,
} from "@/lib/entry-types.ts";
import type { EntryFormProps } from "./entry-form.helper.ts";
import styles from "./style.module.scss";

export function EntryForm({
  idPrefix,
  people,
  fields,
  period,
  error,
  submitLabel,
  canSubmit,
  onSubmit,
}: EntryFormProps) {
  const {
    name,
    setName,
    valueCents,
    setValueCents,
    type,
    setType,
    ownerId,
    setOwnerId,
  } = fields;

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
        value={ownerId}
        onChange={setOwnerId}
        options={people.map((person) => ({
          value: person.id,
          label: person.name,
        }))}
      />
      {period}
      {error ? (
        <p className={styles.error}>
          <span aria-hidden={true}>▲</span> {error}
        </p>
      ) : null}
      <Button onClick={onSubmit} disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
