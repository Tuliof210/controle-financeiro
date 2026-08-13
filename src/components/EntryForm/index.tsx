"use client";

import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { SelectField } from "@/components/SelectField/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
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
    <form className={styles.form} onSubmit={onSubmitForm(onSubmit)}>
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
      {/* role="alert": the error is rendered into a dialog the reader may not
          be looking at, and an unannounced one reads as a dead submit. */}
      {Boolean(error) && (
        <p className={styles.error} role="alert">
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
        </p>
      )}
      <Button type="submit" disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </form>
  );
}
