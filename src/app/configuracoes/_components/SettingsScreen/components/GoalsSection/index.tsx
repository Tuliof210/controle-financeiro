"use client";

import { Target } from "lucide-react";
import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { formatCents } from "@/components/MoneyInput/money.helper";
import { TextField } from "@/components/TextField";
import { SectionCard } from "../SectionCard";
import { useGoalsSection } from "./hook";
import styles from "./style.module.scss";

export function GoalsSection() {
  const {
    goals,
    name,
    setName,
    targetCents,
    setTargetCents,
    error,
    onAdd,
    onDelete,
  } = useGoalsSection();

  return (
    <SectionCard title="Objetivos" icon={Target}>
      {goals?.length === 0 ? (
        <p className={styles.empty}>Nenhum objetivo cadastrado ainda.</p>
      ) : (
        <ul className={styles.list}>
          {goals?.map((goal) => (
            <li key={goal.id} className={styles.row}>
              <span className={styles.name}>{goal.name}</span>
              <span className={styles.target}>
                R$ {formatCents(goal.targetCents)}
              </span>
              <span className={styles.placeholder}>— progresso em breve</span>
              <Button variant="danger" onClick={() => onDelete(goal.id)}>
                Remover
              </Button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.form}>
        <TextField
          id="goal-name"
          label="Nome"
          value={name}
          onChange={setName}
        />
        <MoneyInput
          valueCents={targetCents}
          onChange={setTargetCents}
          ariaLabel="Valor alvo"
        />
        {error ? (
          <p className={styles.error}>
            <span aria-hidden>▲</span> {error}
          </p>
        ) : null}
        <Button onClick={onAdd}>Adicionar</Button>
      </div>
    </SectionCard>
  );
}
