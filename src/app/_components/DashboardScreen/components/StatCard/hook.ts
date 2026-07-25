import type { LucideIcon } from "lucide-react";
import type { Stats } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";

export type StatCardProps = {
  title: string;
  icon: LucideIcon;
  hint: string;
  stats: Stats;
  // Fixed accent for the always-positive cards (Entradas/Saídas). Omitted by
  // Saldo, which derives its accent from the sign instead.
  tone?: "positive" | "negative";
  signed?: boolean;
};

export function useStatCard({
  title,
  icon,
  hint,
  stats,
  tone,
  signed,
}: StatCardProps) {
  // src/styles/README.md rule 7: meaning is never colour-only — money pairs
  // colour with a sign and a ▲/▼ glyph. formatMoney already carries the sign;
  // the glyph is what makes the accent readable without colour vision.
  const negative = signed && stats.total < 0;
  const glyph = signed ? (negative ? "▼" : "▲") : null;

  return {
    title,
    icon,
    hint,
    glyph,
    total: formatMoney(stats.total),
    tone: signed ? (negative ? "negative" : "positive") : tone,
    // Secondary rows stay neutral: formatMoney's minus sign carries the
    // meaning, so they need no glyph to go with an accent colour.
    rows: [
      { key: "current", label: "Valor atual", value: stats.current },
      { key: "mean", label: "Média", value: stats.mean },
      { key: "stdDev", label: "Desvio padrão", value: stats.stdDev },
      { key: "median", label: "Mediana", value: stats.median },
    ].map((row) => ({ ...row, value: formatMoney(row.value) })),
  };
}
