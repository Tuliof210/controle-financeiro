import type { LucideIcon } from "lucide-react";
import type { Stats } from "@/app/api/dashboard/types";
import type { BandTone } from "@/components/SectionCard/hook";
import { formatMoney } from "@/lib/money";
import { spark } from "../../spark.helper";

export type StatCardProps = {
  title: string;
  icon: LucideIcon;
  hint: string;
  stats: Stats;
  // The card's own monthly series, drawn as the sparkline beside the headline.
  series: number[];
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
  series,
  tone,
  signed,
}: StatCardProps) {
  // src/styles/README.md rule 7: meaning is never colour-only — money pairs
  // colour with a sign and a ▲/▼ glyph. formatMoney already carries the sign;
  // the glyph is what makes the accent readable without colour vision.
  const negative = signed && stats.total < 0;
  const glyph = signed ? (negative ? "▼" : "▲") : null;

  // Annotated, not inferred: a bare "brand" in the object literal below widens
  // to `string` and stops matching SectionCard's prop.
  // Keyed on the FIXED tone, for the same reason `color` below is: Saldo's band
  // names the card, so it must not flip green/red with the sign of a total the
  // reader is still looking at.
  const band: BandTone = tone ?? "brand";

  return {
    title,
    icon,
    hint,
    glyph,
    total: formatMoney(stats.total),
    tone: signed ? (negative ? "negative" : "positive") : tone,
    band,
    spark: spark(series),
    // A literal token string handed to SVG as a presentation attribute, exactly
    // as chart.config.ts does: it resolves inside the SVG and follows the theme
    // switch with no JS. Keyed on the FIXED tone, so Saldo's line keeps one
    // colour instead of flipping green/red with the sign of its total.
    color:
      tone === "positive"
        ? "var(--color-positive)"
        : tone === "negative"
          ? "var(--color-negative)"
          : "var(--color-brand)",
    // Secondary rows stay neutral: formatMoney's minus sign carries the
    // meaning, so they need no glyph to go with an accent colour.
    rows: [
      { key: "current", label: "Realizado", value: stats.current },
      { key: "mean", label: "Média/mês", value: stats.mean },
      { key: "median", label: "Mediana", value: stats.median },
      { key: "stdDev", label: "Desvio padrão", value: stats.stdDev },
    ].map((row) => ({ ...row, value: formatMoney(row.value) })),
  };
}
