import type { LucideIcon } from "lucide-react";
import type { Stats } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";

// Which semantic pair the icon chip paints, named after the card's role rather
// than after a token — `_chip.scss` records what each one resolves to, and why
// `negative` lands on the NEUTRAL pair there.
type ChipTone = "positive" | "negative" | "brand";

// `series` used to ride here, drawn as an aria-hidden sparkline on the card's
// bottom edge. It had no axis, no scale and no labels, and restated numbers
// printed directly above it — a chart because dashboards have charts. Cut with
// the owner's decision of 2026-08-13, along with two of the four quadrant
// figures: mediana and desvio padrão of monthly income, three times over, were
// not what this card is read for.
interface StatCardProps {
  title: string;
  icon: LucideIcon;
  hint: string;
  stats: Stats;
  // Fixed accent for the card's FIGURE. Omitted by Saldo, which derives it from
  // the sign, and by Saídas, whose total is an ordinary expense and therefore not
  // red — the constitution's first pillar.
  tone?: "positive" | "negative";
  // Which semantic pair the icon CHIP takes, when it is not the figure's. Split
  // from `tone` for Saídas: the chip names the card and stays on the expense pair
  // (which `_chip.scss` maps to the NEUTRAL fill), while the figure takes no tone
  // at all. Defaults to `tone`, then to brand.
  chip?: ChipTone;
  signed?: boolean;
}

// README rule 7: meaning is never colour-only — the glyph is what makes the
// accent readable without colour vision. Only a signed card draws one.
function signGlyph(signed: boolean | undefined, negative: boolean) {
  if (signed !== true) {
    return null;
  }
  if (negative) {
    return "▼";
  }
  return "▲";
}

// A signed card derives its accent from the sign; the fixed-tone cards keep the
// tone they were given.
function signedTone(
  signed: boolean | undefined,
  negative: boolean,
  tone: StatCardProps["tone"],
) {
  if (signed !== true) {
    return tone;
  }
  if (negative) {
    return "negative" as const;
  }
  return "positive" as const;
}

function useStatCard({
  title,
  icon,
  hint,
  stats,
  tone,
  chip,
  signed,
}: StatCardProps) {
  const negative = signed === true && stats.total < 0;
  const glyph = signGlyph(signed, negative);

  // Annotated, not inferred: a bare "brand" in the literal below widens to
  // `string` and stops indexing index.tsx's chip class map. Never derived from the
  // SIGN: Saldo's chip names the card, so it must not flip green/red with the sign
  // of a total the reader is still looking at.
  const chipTone: ChipTone = chip ?? tone ?? "brand";

  return {
    title,
    icon,
    hint,
    glyph,
    total: stats.total,
    tone: signedTone(signed, negative, tone),
    chip: chipTone,
    // Neutral: formatMoney's minus sign already carries the meaning here.
    rows: [
      { key: "current", label: "Realizado", value: stats.current },
      { key: "mean", label: "Média/mês", value: stats.mean },
    ].map((row) => ({ ...row, value: formatMoney(row.value) })),
  };
}

export type { StatCardProps };
export { useStatCard };
