import type { FocusEvent } from "react";
import {
  BAR_STROKE,
  ESTIMATED_BAR,
  REAL_BAR,
} from "../../../../chart-marks.config.ts";
import type { TooltipContent } from "../../../ChartTooltip/chart-tooltip.types.ts";
import { markLabel } from "../../../ChartTooltip/mark-label.helper.ts";

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
    shape: barShape(estimated),
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
