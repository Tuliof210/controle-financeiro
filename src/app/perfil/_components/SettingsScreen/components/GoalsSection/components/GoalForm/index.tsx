"use client";

import { Button } from "@/components/Button/index.tsx";
import { Field } from "@/components/Field/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { type GoalFormProps, useGoalForm } from "./hook.ts";
import styles from "./style.module.scss";

const NAME_ID = "goal-name";
const TARGET_ID = "goal-target";

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
      <Field id={NAME_ID} label="Nome" value={name} onChange={setName} />
      <Field
        money={true}
        id={TARGET_ID}
        label="Valor alvo"
        value={targetCents}
        onChange={setTargetCents}
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
