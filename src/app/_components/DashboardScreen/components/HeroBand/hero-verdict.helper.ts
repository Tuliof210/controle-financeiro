import type { Ceiling } from "@/app/api/dashboard/ceiling.types.ts";
import type { CeilingCap } from "@/lib/ceiling-caps.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import {
  limitedByMeta,
  limitLabel,
} from "../CeilingCard/ceiling-card.helper.ts";

// The sentence the page never said.
//
// Every card on this screen states its conclusion before its evidence; the PAGE
// did the reverse — ~90 numbers and four competing headline figures, and nowhere
// the one line the product exists to produce. This is that line.
//
// It deliberately does NOT repeat the figure: the figure is the headline directly
// above it, and printing it twice is what MoneyFigure exists to prevent.
export interface HeroVerdict {
  tone: "positive" | "caution" | "negative";
  sentence: string;
  // Reuses the card's own label rather than spelling "Limitado por …" a second
  // time — two copies would be two ways to name one limit.
  limit: string | null;
}

// Three branches, not one. `firstRed !== null` IMPLIES `monthly === 0`
// (ceiling.types.ts), so a red month is a different statement from a zero
// ceiling with no red month, and both are different from having room.
export function verdictFor(
  ceiling: Ceiling,
  meta: number | null,
  cap: CeilingCap,
): HeroVerdict {
  const { monthly, tightest, firstRed } = ceiling;
  const limit = limitLabel(limitedByMeta(cap, meta, monthly), tightest);

  if (firstRed !== null) {
    const when = formatYyyymm(firstRed.month);
    const how = formatMoney(firstRed.shortfall);
    return {
      tone: "negative",
      sentence: `${when} já fecha ${how} no vermelho.`,
      // No limit chip: nothing is limiting a ceiling that does not exist.
      limit: null,
    };
  }

  if (monthly === 0) {
    return {
      tone: "caution",
      sentence: "Nenhum gasto extra cabe neste mês.",
      limit,
    };
  }

  return {
    tone: "positive",
    sentence: "Dá para gastar sem nenhum mês fechar negativo.",
    limit,
  };
}
