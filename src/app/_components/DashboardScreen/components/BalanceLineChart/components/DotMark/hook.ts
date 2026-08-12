// A projected point draws at half opacity.
const PROJECTED_OPACITY = 0.5;

interface PointerLocation {
  clientX: number;
  clientY: number;
}

interface DotMarkProps {
  cx: number;
  cy: number;
  title: string;
  projected: boolean;
  showTooltip: (event: PointerLocation, text: string) => void;
  hideTooltip: () => void;
}

// The mark binds its own title to the tooltip, so the chart's map hands over
// plain references instead of building three closures per dot in the JSX.
function useDotMark({
  cx,
  cy,
  title,
  projected,
  showTooltip,
  hideTooltip,
}: DotMarkProps) {
  return {
    cx,
    cy,
    title,
    opacity: projected ? PROJECTED_OPACITY : 1,
    show: (event: PointerLocation) => showTooltip(event, title),
    hide: hideTooltip,
  };
}

export type { DotMarkProps };
export { useDotMark };
