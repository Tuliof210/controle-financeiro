import type { Period } from "@/components/EntryScreen/types";
import { coverage } from "../../coverage.helper";
import { formatMonths } from "../../recurrence-range.helper";

export type CoverageBarProps = {
  months: number[];
  // null until the owner saves a global range in Configurações — there is then
  // nothing to measure against, so no track is drawn at all and the interval
  // label stands alone.
  period: Period | null;
};

export function useCoverageBar({ months, period }: CoverageBarProps) {
  const label = formatMonths(months);

  return {
    label,
    segments: period ? coverage(months, period) : null,
    // The bar only reinforces the label beside it, which is the real content —
    // so role="img" with the same words is honest, not a second source of truth.
    srLabel: `Vigência: ${label}`,
  };
}
