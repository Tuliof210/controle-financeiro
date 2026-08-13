import type { FocusEvent } from "react";
import { SIMULATED_DASHARRAY } from "../../../../chart-marks.config.ts";
import type { TooltipContent } from "../../../ChartTooltip/chart-tooltip.types.ts";
import { markLabel } from "../../../ChartTooltip/mark-label.helper.ts";

// A projected point draws at half opacity. It is reinforcement only: the dashed
// stroke of the path it sits on, and the ESTIMADO word in the bubble, are what
// carry the fact without colour.
const PROJECTED_OPACITY = 0.5;

// undefined, not "none": an absent attribute leaves the ring solid, and React
// drops it rather than writing an override.
const dotDash = (simulated: boolean): string | undefined => {
  if (simulated) {
    return SIMULATED_DASHARRAY;
  }
};

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
  // A what-if is visible in this month's figures. It takes a DOTTED ring where a
  // projection is a plain half-opacity one, so the two never draw alike.
  simulated: boolean;
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
  simulated,
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
    dash: dotDash(simulated),
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
