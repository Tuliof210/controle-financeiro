"use client";

import { PiggyBank } from "lucide-react";
import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { SectionCard } from "../SectionCard";
import { useMonthlyGoalSection } from "./hook";
import styles from "./style.module.scss";

export function MonthlyGoalSection() {
  const {
    monthlyGoalCents,
    setMonthlyGoalCents,
    loaded,
    saved,
    error,
    onSave,
  } = useMonthlyGoalSection();

  return (
    <SectionCard title="Meta mensal" icon={PiggyBank}>
      <MoneyInput
        valueCents={monthlyGoalCents}
        onChange={setMonthlyGoalCents}
        ariaLabel="Meta mensal"
      />
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
      {saved ? <p className={styles.saved}>Salvo</p> : null}
      <Button onClick={onSave} disabled={!loaded}>
        Salvar
      </Button>
    </SectionCard>
  );
}
