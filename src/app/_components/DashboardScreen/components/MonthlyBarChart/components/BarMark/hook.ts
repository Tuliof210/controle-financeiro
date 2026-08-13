import {
  BAR_STROKE,
  ESTIMATED_BAR,
  REAL_BAR,
} from "../../../../chart-marks.config.ts";
import type { TooltipContent } from "../../../ChartTooltip/hook.ts";

// The projected bar is drawn as a dashed OUTLINE with a wash inside it; the real
// one is the same geometry with the stroke at zero opacity. Opacity alone would
// be colour-only encoding — see chart-marks.config.ts.
const barShape = (estimated: boolean) => {
  if (estimated) {
    return { ...BAR_STROKE, ...ESTIMATED_BAR };
  }
  return { ...BAR_STROKE, ...REAL_BAR };
};

interface PointerLocation {
  clientX: number;
  clientY: number;
}

interface BarMarkProps {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  estimated: boolean;
  // Accessible name for the hit target: it carries the month, the series, the
  // figure AND the projected/recorded word, so the bar's shape is never the only
  // place that fact lives.
  title: string;
  // The whole month's figures, shared by both bars of the month — the same
  // three lines the target's bubble shows.
  tip: TooltipContent;
  // The full plot height: the hit target is the whole column, not the bar.
  plotHeight: number;
  showTooltip: (event: PointerLocation, content: TooltipContent) => void;
  hideTooltip: () => void;
}

// The mark binds its own tooltip content, so the chart's map hands over plain
// references instead of building three closures per bar in the JSX.
function useBarMark({
  title,
  estimated,
  tip,
  showTooltip,
  hideTooltip,
  ...rest
}: BarMarkProps) {
  return {
    ...rest,
    title,
    shape: barShape(estimated),
    show: (event: PointerLocation) => showTooltip(event, tip),
    hide: hideTooltip,
  };
}

export type { BarMarkProps };
export { useBarMark };
