import type { FocusEvent } from "react";
import type { TooltipContent } from "../../../ChartTooltip/chart-tooltip.types.ts";
import { markLabel } from "../../../ChartTooltip/mark-label.helper.ts";

// A projected point draws at half opacity. It is reinforcement only: the dashed
// stroke of the path it sits on, and the ESTIMADO word in the bubble, are what
// carry the fact without colour.
const PROJECTED_OPACITY = 0.5;

const dotOpacity = (projected: boolean): number => {
  if (projected) {
    return PROJECTED_OPACITY;
  }
  return 1;
};

interface PointerLocation {
  clientX: number;
  clientY: number;
}

interface DotMarkProps {
  cx: number;
  cy: number;
  projected: boolean;
  tip: TooltipContent;
  showTooltip: (event: PointerLocation, content: TooltipContent) => void;
  hideTooltip: () => void;
}

// The mark binds its own tooltip content, so the chart's map hands over plain
// references instead of building three closures per dot in the JSX.
function useDotMark({
  cx,
  cy,
  projected,
  tip,
  showTooltip,
  hideTooltip,
}: DotMarkProps) {
  return {
    cx,
    cy,
    // The whole bubble, not just "month · acumulado": a keyboard reader lands
    // HERE and the bubble is aria-hidden, so this string is the only route to the
    // figures. A `title` prop used to carry a shorter readout; it is gone.
    label: markLabel(tip),
    opacity: dotOpacity(projected),
    show: (event: PointerLocation) => showTooltip(event, tip),
    // A focus event has no clientX/clientY, so the bubble is anchored to the
    // mark's own box instead of to a pointer that is not there.
    focus: (event: FocusEvent<SVGCircleElement>) => {
      const box = event.currentTarget.getBoundingClientRect();
      showTooltip({ clientX: box.left + box.width / 2, clientY: box.top }, tip);
    },
    hide: hideTooltip,
  };
}

export type { DotMarkProps };
export { useDotMark };
