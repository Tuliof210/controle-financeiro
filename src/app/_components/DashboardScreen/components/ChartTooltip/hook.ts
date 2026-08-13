import { useState } from "react";

// Which token paints a value row. Named after the series' role, not after the
// token — index.tsx holds the map, exactly as StatCard's chip does.
type TooltipTone = "positive" | "negative" | "brand" | "neutral";

interface TooltipRow {
  key: string;
  label: string;
  value: string;
  tone: TooltipTone;
}

// What a mark hands over when the pointer reaches it. `tag` is the REAL /
// ESTIMADO word: the projection is carried in words here, never by the colour of
// the rows below it. `plotX` is the mark's own x IN PLOT COORDINATES, so the
// chart can draw its crosshair from the same hover this bubble already tracks
// instead of holding a second piece of state that could disagree with it.
interface TooltipContent {
  title: string;
  tag: string;
  rows: TooltipRow[];
  plotX?: number;
}

type TooltipState = ({ x: number; y: number } & TooltipContent) | null;

// Structural, not React.PointerEvent<T> — showTooltip only ever reads
// clientX/clientY, so any pointer event from any mark element fits without
// generic-variance juggling.
interface PointerLocation {
  clientX: number;
  clientY: number;
}

// Called from the chart that owns the marks (BalanceLineChart,
// MonthlyBarChart), not from ChartTooltip itself: the trigger (a dot or bar)
// and the bubble that renders it are siblings, not parent/child, so the
// state lives here and gets threaded to <ChartTooltip> as a prop.
export function useChartTooltip() {
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  const showTooltip = (event: PointerLocation, content: TooltipContent) =>
    setTooltip({ x: event.clientX, y: event.clientY, ...content });

  const hideTooltip = () => setTooltip(null);

  return { tooltip, showTooltip, hideTooltip };
}

export type { TooltipContent, TooltipRow, TooltipState, TooltipTone };
