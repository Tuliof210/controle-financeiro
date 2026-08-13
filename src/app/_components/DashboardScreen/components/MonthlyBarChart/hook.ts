import { useMemo } from "react";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { useChartTooltip } from "../ChartTooltip/hook.ts";
import { buildBars } from "./bar-build.helper.ts";
import { bandOf, bandStartOf } from "./bar-series.helper.ts";

interface MonthlyBarChartProps {
  points: MonthPoint[];
  // First month the payload calls a projection. The bars read per-point
  // `incomeEstimated`/`expenseEstimated`; this is the one figure saying where
  // the projected REGION starts, and it is deliberately NOT clamped to the
  // current month — an under-recorded past month opens the band early, which is
  // the intent.
  dashedFrom: number | null;
  width: number;
  height: number;
}

// The tooltip state lives HERE, not in `index.tsx`: ARCHITECTURE.md's three-file
// rule gives the view no state and no logic, and both charts were calling
// useChartTooltip from their views.
//
// `useMemo` on the geometry, keyed on the only three inputs it reads. Every
// pointer move calls setTooltip, which re-renders this component, which used to
// rebuild three d3 scales, call .ticks() twice, and re-run formatMoney and
// formatYyyymm three times per month — for a frame whose inputs had not changed.
function useMonthlyBarChart({
  points,
  dashedFrom,
  width,
  height,
}: MonthlyBarChartProps) {
  const { tooltip, showTooltip, hideTooltip } = useChartTooltip();

  const { frame, bars } = useMemo(
    () => buildBars(points, width, height),
    [points, width, height],
  );

  // The band starts at the leading edge of the first projected month's own band
  // — not its centre — so the dashed rule lands where the month begins. Null
  // whenever nothing is projected, or the month fell outside the range.
  const band = useMemo(
    () => bandOf(bandStartOf(dashedFrom, frame.monthScale), frame.innerWidth),
    [dashedFrom, frame],
  );

  return {
    frame,
    bars,
    width,
    height,
    band,
    tooltip,
    showTooltip,
    hideTooltip,
  };
}

export type { MonthlyBarChartProps };
export { useMonthlyBarChart };
