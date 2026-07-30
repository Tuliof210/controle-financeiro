import { useState } from "react";

type TooltipState = { x: number; y: number; text: string } | null;
// Structural, not React.PointerEvent<T> — showTooltip only ever reads
// clientX/clientY, so any pointer event from any mark element fits without
// generic-variance juggling.
type PointerLocation = { clientX: number; clientY: number };

// Called from the chart that owns the marks (BalanceLineChart,
// MonthlyBarChart), not from ChartTooltip itself: the trigger (a dot or bar)
// and the bubble that renders it are siblings, not parent/child, so the
// state lives here and gets threaded to <ChartTooltip> as a prop.
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const showTooltip = (event: PointerLocation, text: string) =>
    setTooltip({ x: event.clientX, y: event.clientY, text });

  const hideTooltip = () => setTooltip(null);

  return { tooltip, showTooltip, hideTooltip };
}

export type { TooltipState };
