import type { Period } from "@/core/use-cases/period.service.ts";
import { coverage } from "../../coverage.helper.ts";

export interface CoverageBarProps {
  months: number[];
  // Non-nullable now: with no global range saved there is nothing to measure
  // against and no band to draw, and the screen decides that before rendering
  // this — so the row emits no band cell at all rather than an empty one.
  period: Period;
}

export function useCoverageBar({ months, period }: CoverageBarProps) {
  // Still `[]` when a range exists but no month of this forecast falls in it:
  // an empty track is the honest drawing of "in range, active in none of it".
  return { segments: coverage(months, period) };
}
