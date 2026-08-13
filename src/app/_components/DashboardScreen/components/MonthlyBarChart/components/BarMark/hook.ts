import type { FocusEvent } from "react";
import {
  BAR_STROKE,
  ESTIMATED_BAR,
  REAL_BAR,
  SIMULATED_BAR,
} from "../../../../chart-marks.config.ts";
import type { TooltipContent } from "../../../ChartTooltip/chart-tooltip.types.ts";
import { markLabel } from "../../../ChartTooltip/mark-label.helper.ts";

// The projected bar is drawn as a dashed OUTLINE with a wash inside it; the real
// one is the same geometry with the stroke at zero opacity. Opacity alone would
// be colour-only encoding — see chart-marks.config.ts.
// Three shapes, not two. A simulated month takes a DOTTED contour where a
// projected one is dashed, so a what-if never draws like a committed forecast —
// PRODUCT.md's invariant, and the fourth channel beside the word in the bubble.
const barShape = (estimated: boolean, simulated: boolean) => {
  if (simulated) {
    return { ...BAR_STROKE, ...SIMULATED_BAR };
  }
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
  // A what-if is visible in this month's figures — a weaker claim than a
  // committed forecast, and it takes its own contour.
  simulated: boolean;
  // The whole month's figures, shared by both bars of the month — the same three
  // lines the bubble shows, and the source of the hit target's accessible name.
  // A `title` prop used to carry a shorter, per-series readout; the mark now says
  // everything the bubble does, because the bubble is aria-hidden.
  tip: TooltipContent;
  // The full plot height: the hit target is the whole column, not the bar.
  plotHeight: number;
  showTooltip: (event: PointerLocation, content: TooltipContent) => void;
  hideTooltip: () => void;
}

// The mark binds its own tooltip content, so the chart's map hands over plain
// references instead of building three closures per bar in the JSX.
function useBarMark({
  estimated,
  simulated,
  tip,
  showTooltip,
  hideTooltip,
  ...rest
}: BarMarkProps) {
  return {
    ...rest,
    // The whole bubble, not one series' figure: a keyboard reader lands HERE and
    // the bubble is aria-hidden, so this string is the only route to entradas and
    // saídas per month, which appear nowhere else on this screen. `title` is
    // ignored on purpose — it carried a shorter readout.
    label: markLabel(tip),
    shape: barShape(estimated, simulated),
    show: (event: PointerLocation) => showTooltip(event, tip),
    // A focus event has no clientX/clientY, so the bubble anchors to the mark's
    // own box instead of to a pointer that is not there.
    focus: (event: FocusEvent<SVGRectElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      showTooltip({ clientX: box.left + box.width / 2, clientY: box.top }, tip);
    },
    hide: hideTooltip,
  };
}

export type { BarMarkProps };
export { useBarMark };
