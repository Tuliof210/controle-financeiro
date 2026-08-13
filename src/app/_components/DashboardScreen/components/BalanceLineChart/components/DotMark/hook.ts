import type { TooltipContent } from "../../../ChartTooltip/hook.ts";

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
  title: string;
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
  title,
  projected,
  tip,
  showTooltip,
  hideTooltip,
}: DotMarkProps) {
  return {
    cx,
    cy,
    title,
    opacity: dotOpacity(projected),
    show: (event: PointerLocation) => showTooltip(event, tip),
    hide: hideTooltip,
  };
}

export type { DotMarkProps };
export { useDotMark };
