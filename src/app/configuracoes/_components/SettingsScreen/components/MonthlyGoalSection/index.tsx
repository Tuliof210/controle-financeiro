"use client";

import { PiggyBank } from "lucide-react";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { MoneyInput } from "@/components/MoneyInput";
import { SectionCard } from "@/components/SectionCard";
import { formatMoney } from "@/lib/money";
import { useMonthlyGoalSection } from "./hook";
import styles from "./style.module.scss";

export function MonthlyGoalSection() {
  const {
    monthlyGoalCents,
    setMonthlyGoalCents,
    savedGoalCents,
    loaded,
    error,
    open,
    openModal,
    closeModal,
    onSave,
  } = useMonthlyGoalSection();

  return (
    <SectionCard title="Meta mensal" icon={PiggyBank}>
      <div className={styles.row}>
        <div>
          {/* `> 0`, not `!== null`: 0 is the repo's "unset" for this setting
              (limit.helper.ts reads it the same way). Do not tighten it. */}
          <p className={styles.summary}>
            {savedGoalCents > 0 ? formatMoney(savedGoalCents) : "—"}
          </p>
          <p className={styles.caption}>
            teto de gastos por mês para a família
          </p>
        </div>
        <Button variant="ghost" onClick={openModal}>
          Editar
        </Button>
      </div>
      <Modal
        open={open}
        onClose={closeModal}
        eyebrow="META"
        title="Editar meta mensal"
        footer={
          <Button onClick={onSave} disabled={!loaded}>
            Salvar
          </Button>
        }
      >
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
      </Modal>
    </SectionCard>
  );
}
