import { useMemo } from "react";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { buildLine } from "./line-build.helper.ts";

interface BalanceLineChartProps {
  points: MonthPoint[];
  dashedFrom: number | null;
  // The month the Teto card calls its bottleneck (`Ceiling.tightest`), NOT this
  // curve's own minimum: that is the suffix minimum of `ceilingBalance`, a
  // different series, and two marks naming two different months on one screen
  // is the thing to avoid. Null when there is no ceiling at all.
  tightest: number | null;
  width: number;
  height: number;
}

// The tooltip state lives HERE, not in `index.tsx`: ARCHITECTURE.md's three-file
// rule gives the view no state and no logic, and both charts were calling
// useChartTooltip from their views.
//
// `useMemo` on the geometry, keyed on the only inputs it reads. Every pointer move
// calls setTooltip, which re-renders this component, which used to rebuild three
// d3 scales, call .ticks() twice, run a third scale over a flatMap of the whole
// series, and re-run formatMoney and formatYyyymm per month — for a frame whose
// inputs had not changed.
function useBalanceLineChart({
  points,
  dashedFrom,
  tightest,
  width,
  height,
}: BalanceLineChartProps) {
  const { tooltip, showTooltip, hideTooltip } = useChartTooltip();

  const built = useMemo(
    () => buildLine({ points, dashedFrom, tightest, width, height }),
    [points, dashedFrom, tightest, width, height],
  );

  return {
    ...built,
    width,
    height,
    tooltip,
    showTooltip,
    hideTooltip,
  };
}

export type { BalanceLineChartProps };
export { useBalanceLineChart };
