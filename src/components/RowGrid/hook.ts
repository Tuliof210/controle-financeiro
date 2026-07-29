import type { ReactNode } from "react";

export type RowGridProps = {
  // One `<li>` per row, holding its cells as FLAT children — no wrapper of any
  // kind. Each cell is tagged `data-cell="who|main|amt|act"`, plus an optional
  // `bar`, and that tag is the only thing style.module.scss places it by: a row
  // omits a cell it has no use for (a goal has no `who`) rather than emitting an
  // empty one, and every other cell stays in its own area.
  //
  // Placement is done entirely by CSS attribute selector, so a mistyped or
  // missing tag fails SILENTLY — no type error, no lint error, no red spec, just
  // a cell in the wrong place and an action pair that has lost its flex.
  children: ReactNode;
};

// Nothing to derive — the layout is entirely CSS. The hook exists so the
// folder reads like every other component in the repo.
export function useRowGrid(props: RowGridProps) {
  return props;
}
