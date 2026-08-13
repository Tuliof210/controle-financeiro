"use client";

import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { type GoalFormProps, useGoalForm } from "./hook.ts";
import styles from "./style.module.scss";

const NAME_ID = "goal-name";

export function GoalForm({
  initial,
  error,
  submitLabel,
  onSubmit,
}: GoalFormProps) {
  const {
    name,
    setName,
    targetCents,
    setTargetCents,
    localError,
    handleSubmit,
  } = useGoalForm({ initial, onSubmit });
  const shownError = localError ?? error;

  return (
    <form className={styles.form} onSubmit={onSubmitForm(handleSubmit)}>
      <TextField id={NAME_ID} label="Nome" value={name} onChange={setName} />
      <MoneyInput
        valueCents={targetCents}
        onChange={setTargetCents}
        ariaLabel="Valor alvo"
      />
      {Boolean(shownError) && (
        <p className={styles.error} role="alert">
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {shownError}
        </p>
      )}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
