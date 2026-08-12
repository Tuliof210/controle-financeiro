"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { MoneyInput } from "@/components/MoneyInput/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { useSpendingGoalSection } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  meta: "Meta",
  quantoVocePretende:
    "Quanto você pretende gastar por mês. Com ela salva, o Teto de Gastos ganha o alvo",
  queLiberaEste:
    ", que libera este valor ou o teto do mês — o que for menor. Zero desliga o alvo.",
} as const;

export function SpendingGoalSection() {
  const { cents, error, saved, onChange, onSave } = useSpendingGoalSection();

  return (
    <SectionCard title="Meta mensal" icon={Wallet}>
      <p className={styles.help}>
        {COPY.quantoVocePretende} <strong>{COPY.meta}</strong>
        {COPY.queLiberaEste}
      </p>
      <MoneyInput
        valueCents={cents}
        onChange={onChange}
        ariaLabel="Meta mensal"
      />
      {Boolean(error) && (
        <p className={styles.error}>
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
        </p>
      )}
      <Button variant={saved ? "success" : "primary"} onClick={onSave}>
        {saved ? "Salvo" : "Salvar"}
      </Button>
    </SectionCard>
  );
}
