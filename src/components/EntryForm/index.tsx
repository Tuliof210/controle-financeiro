"use client";

import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { SelectField } from "@/components/SelectField/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { TypeToggle } from "./components/TypeToggle/index.tsx";
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
      <TypeToggle value={type} onChange={setType} />
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
