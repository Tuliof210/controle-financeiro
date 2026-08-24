import { useState } from "react";
import { formatMoney } from "@/lib/money.ts";
import { canAfford } from "./can-afford.helper.ts";

export interface AffordAskProps {
  monthlyCents: number;
}

const COPY = {
  cabe: (remaining: string) => `Cabe. Sobram ${remaining} neste mês.`,
  naoCabe: (shortfall: string) =>
    `Não cabe. Faltam ${shortfall} neste mês.`,
} as const;

export function useAffordAsk({ monthlyCents }: AffordAskProps) {
  const [amountCents, setAmountCents] = useState(0);

  let answer: string | undefined;
  let fits: boolean | undefined;
  if (amountCents > 0) {
    const result = canAfford(amountCents, monthlyCents);
    if (result.ok) {
      answer = COPY.cabe(formatMoney(result.remainingCents));
      fits = true;
    } else {
      answer = COPY.naoCabe(formatMoney(result.shortfallCents));
      fits = false;
    }
  }

  return { amountCents, setAmountCents, answer, fits };
}
