import { useId, useState } from "react";
import { formatMoney } from "@/lib/money.ts";
import { canAfford } from "./can-afford.helper.ts";
import styles from "./style.module.scss";

const COPY = {
  cabe: (remaining: string) => `Cabe. Sobram ${remaining} neste mês.`,
  naoCabe: (shortfall: string) => `Não cabe. Faltam ${shortfall} neste mês.`,
} as const;

interface AffordAskProps {
  monthlyCents: number;
}

// The class comes out of here, not out of index.tsx: a folder's index renders
// what its hook returns and decides nothing.
function answerFor(amountCents: number, monthlyCents: number) {
  // An empty or zero field is not a question, so it gets no answer.
  if (amountCents <= 0) {
    return {};
  }
  const result = canAfford(amountCents, monthlyCents);
  if (result.ok) {
    return {
      answer: COPY.cabe(formatMoney(result.remainingCents)),
      answerClass: styles.fits,
    };
  }
  return {
    answer: COPY.naoCabe(formatMoney(result.shortfallCents)),
    answerClass: styles.short,
  };
}

export function useAffordAsk({ monthlyCents }: AffordAskProps) {
  const [amountCents, setAmountCents] = useState(0);
  const fieldId = useId();

  return {
    amountCents,
    setAmountCents,
    fieldId,
    answerId: `${fieldId}-answer`,
    ...answerFor(amountCents, monthlyCents),
  };
}

export type { AffordAskProps };
