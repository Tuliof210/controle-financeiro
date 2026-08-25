import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

interface PlotLinesProps {
  teto: CeilingMonth[];
  solid: MonthPoint[];
  dashed: MonthPoint[];
  x: (point: MonthPoint) => number;
  y: (point: MonthPoint) => number;
  xTeto: (month: CeilingMonth) => number;
  yTeto: (month: CeilingMonth) => number;
}

function usePlotLines(props: PlotLinesProps) {
  return props;
}

export type { PlotLinesProps };
export { usePlotLines };
