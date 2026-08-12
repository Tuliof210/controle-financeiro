"use client";

import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { type GoalFormProps, useGoalForm } from "./hook.ts";
import styles from "./style.module.scss";

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
    <div className={styles.form}>
      <TextField id="goal-name" label="Nome" value={name} onChange={setName} />
      <MoneyInput
        valueCents={targetCents}
        onChange={setTargetCents}
        ariaLabel="Valor alvo"
      />
      {shownError ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {shownError}
        </p>
      ) : null}
      <Button onClick={handleSubmit}>{submitLabel}</Button>
    </div>
  );
}
