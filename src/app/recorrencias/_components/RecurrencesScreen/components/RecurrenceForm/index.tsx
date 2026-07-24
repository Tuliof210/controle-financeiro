"use client";

import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { TextField } from "@/components/TextField";
import { ENTRY_TYPES, SELECTED_VARIANT, TYPE_LABELS } from "@/lib/entry-types";
import { IntervalList } from "./components/IntervalList";
import { type RecurrenceFormProps, useRecurrenceForm } from "./hook";
import styles from "./style.module.scss";

export function RecurrenceForm(props: RecurrenceFormProps) {
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
    months,
    intervals,
    updateInterval,
    addInterval,
    removeInterval,
    localError,
    canSubmit,
    handleSubmit,
  } = useRecurrenceForm(props);
  const shownError = localError ?? error;

  return (
    <div className={styles.form}>
      <TextField
        id="recurrence-name"
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
      <div className={styles.field}>
        <label htmlFor="recurrence-owner" className={styles.label}>
          Responsável
        </label>
        <select
          id="recurrence-owner"
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
        <IntervalList
          months={months}
          intervals={intervals}
          onUpdate={updateInterval}
          onAdd={addInterval}
          onRemove={removeInterval}
        />
      ) : (
        <p className={styles.guard}>
          Defina o período global em Configurações para cadastrar recorrências.
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
