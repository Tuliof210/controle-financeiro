"use client";

import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { TextField } from "@/components/TextField";
import { MOVEMENT_TYPES } from "@/lib/movement-types";
import { type MovementFormProps, useMovementForm } from "./hook";
import { formatYyyymm } from "./month.helper";
import styles from "./style.module.scss";

const TYPE_LABELS = { income: "Entrada", expense: "Saída" } as const;
const SELECTED_VARIANT = { income: "success", expense: "danger" } as const;

export function MovementForm(props: MovementFormProps) {
  const { error, submitLabel, people, period } = props;
  const {
    name,
    setName,
    valueCents,
    setValueCents,
    type,
    setType,
    ownerId,
    setOwnerId,
    month,
    setMonth,
    monthOptions,
    localError,
    canSubmit,
    handleSubmit,
  } = useMovementForm(props);
  const shownError = localError ?? error;

  return (
    <div className={styles.form}>
      <TextField
        id="movement-name"
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
        {MOVEMENT_TYPES.map((kind) => (
          <Button
            key={kind}
            variant={type === kind ? SELECTED_VARIANT[kind] : "ghost"}
            onClick={() => setType(kind)}
          >
            {TYPE_LABELS[kind]}
          </Button>
        ))}
      </div>
      <div className={styles.field}>
        <label htmlFor="movement-owner" className={styles.label}>
          Responsável
        </label>
        <select
          id="movement-owner"
          aria-label="Responsável"
          className={styles.select}
          value={ownerId}
          onChange={(event) => setOwnerId(event.target.value)}
        >
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
      </div>
      {period ? (
        <div className={styles.field}>
          <label htmlFor="movement-month" className={styles.label}>
            Mês
          </label>
          <select
            id="movement-month"
            aria-label="Mês"
            className={styles.select}
            value={month}
            onChange={(event) => setMonth(Number(event.target.value))}
          >
            {monthOptions.map((option) => (
              <option key={option} value={option}>
                {formatYyyymm(option)}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <p className={styles.guard}>
          Defina o período global em Configurações para cadastrar movimentações.
        </p>
      )}
      {shownError ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {shownError}
        </p>
      ) : null}
      <Button onClick={handleSubmit} disabled={!canSubmit}>
        {submitLabel}
      </Button>
    </div>
  );
}
