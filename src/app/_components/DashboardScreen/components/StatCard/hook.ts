import type { Stats } from "@/app/api/dashboard/types.ts";
import type { MvIconName } from "@/components/Icon/hook.ts";
import { formatMoney } from "@/lib/money.ts";
import { spark } from "../../spark.helper.ts";

// Which semantic pair the icon chip paints, named after the card's role rather
// than after a token — `_chip.scss` records what each one resolves to, and why
// `negative` lands on the NEUTRAL pair there.
type ChipTone = "positive" | "negative" | "brand";

interface StatCardProps {
  title: string;
  icon: MvIconName;
  hint: string;
  stats: Stats;
  // The card's own monthly series, drawn as the sparkline beside the headline.
  series: number[];
  // Fixed accent for the always-positive cards (Entradas/Saídas). Omitted by
  // Saldo, which derives its accent from the sign instead.
  tone?: "positive" | "negative";
  signed?: boolean;
}

// A signed card derives its accent from the sign. A normal expense is not red.
function signedTone(
  signed: boolean | undefined,
  negative: boolean,
  tone: StatCardProps["tone"],
) {
  if (signed !== true) {
    if (tone === "negative") {
      return;
    }
    return tone;
  }
  if (negative) {
    return "negative" as const;
  }
  return "positive" as const;
}

// A token string handed to SVG as a presentation attribute, as chart.config.ts
// does: it resolves inside the SVG and follows the theme switch with no JS.
// Keyed on the FIXED tone, so Saldo's line keeps one colour. Saídas uses the
// same secondary ink as the chip — a normal expense is not red.
const TONE_COLOR = {
  positive: "var(--color-positive)",
  negative: "var(--color-text-secondary)",
  brand: "var(--color-brand)",
} as const;

function useStatCard({
  title,
  icon,
  hint,
  stats,
  series,
  tone,
  signed,
}: StatCardProps) {
  const negative = signed === true && stats.total < 0;
  const chip: ChipTone = tone ?? "brand";

  return {
    title,
    icon,
    hint,
    signed: signed === true,
    total: stats.total,
    tone: signedTone(signed, negative, tone),
    chip,
    spark: spark(series),
    color: TONE_COLOR[tone ?? "brand"],
    rows: [
      { key: "current", label: "Realizado", value: stats.current },
      { key: "mean", label: "Média/mês", value: stats.mean },
      { key: "median", label: "Mediana", value: stats.median },
      { key: "stdDev", label: "Desvio padrão", value: stats.stdDev },
    ].map((row) => ({ ...row, value: formatMoney(row.value) })),
  };
}

export type { StatCardProps };
export { useStatCard };
