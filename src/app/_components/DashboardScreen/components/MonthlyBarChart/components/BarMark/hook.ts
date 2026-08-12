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
  title: string;
  // The full plot height: the hit target is the whole column, not the bar.
  plotHeight: number;
  showTooltip: (event: PointerLocation, text: string) => void;
  hideTooltip: () => void;
}

// The mark binds its own title to the tooltip, so the chart's map hands over
// plain references instead of building three closures per bar in the JSX.
function useBarMark({
  title,
  showTooltip,
  hideTooltip,
  ...rest
}: BarMarkProps) {
  return {
    ...rest,
    title,
    show: (event: PointerLocation) => showTooltip(event, title),
    hide: hideTooltip,
  };
}

export type { BarMarkProps };
export { useBarMark };
