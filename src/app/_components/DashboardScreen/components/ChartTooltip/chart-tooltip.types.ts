// The bubble's shapes, split off `hook.ts` for the 100-line cap once that file
// gained the Escape handler and the view's own hook. Types only — no runtime.

// Which token paints a value row. Named after the series' role, not after the
// token; `hook.ts` holds the class map.
export type TooltipTone = "positive" | "negative" | "brand" | "neutral";

export interface TooltipRow {
  key: string;
  label: string;
  value: string;
  tone: TooltipTone;
}

// What a mark hands over when the pointer or the focus reaches it. `tag` is the
// REAL / ESTIMADO word: the projection is carried in words here, never by the
// colour of the rows below it. `plotX` is the mark's own x IN PLOT COORDINATES, so
// the chart can draw its crosshair from the same hover this bubble already tracks
// instead of holding a second piece of state that could disagree with it.
export interface TooltipContent {
  title: string;
  tag: string;
  rows: TooltipRow[];
  plotX?: number;
}

export type TooltipState = ({ x: number; y: number } & TooltipContent) | null;

// Structural, not React.PointerEvent<T> — showTooltip only ever reads
// clientX/clientY, so any pointer event from any mark element fits without
// generic-variance juggling.
export interface PointerLocation {
  clientX: number;
  clientY: number;
}
