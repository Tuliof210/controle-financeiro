"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/Button";
import { MoneyInput } from "@/components/MoneyInput";
import { SectionCard } from "@/components/SectionCard";
import { useSpendingGoalSection } from "./hook";
import styles from "./style.module.scss";

export function SpendingGoalSection() {
  const { cents, error, saved, onChange, onSave } = useSpendingGoalSection();

  return (
    <SectionCard title="Meta mensal" icon={Wallet}>
      <p className={styles.help}>
        Quanto você pretende gastar por mês. Com ela salva, o Teto de Gastos
        ganha o alvo <strong>Meta</strong>, que libera este valor ou o teto do
        mês — o que for menor. Zero desliga o alvo.
      </p>
      <MoneyInput
        valueCents={cents}
        onChange={onChange}
        ariaLabel="Meta mensal"
      />
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
      <Button variant={saved ? "success" : "primary"} onClick={onSave}>
        {saved ? "Salvo" : "Salvar"}
      </Button>
    </SectionCard>
  );
}
