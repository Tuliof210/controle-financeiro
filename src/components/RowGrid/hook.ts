import type { ReactNode } from "react";

export type RowGridProps = {
  // One `<li>` per row, holding exactly two halves: `data-row="data"` and
  // `data-row="controls"`. Inside the data half the cells are flat, tagged
  // `data-cell="swatch|name|value|owner|period"` — the tag is how
  // style.module.scss places a cell in the shared track set, so a row that has
  // no owner simply omits the cell instead of emitting an empty one.
  children: ReactNode;
};

// Nothing to derive — the layout is entirely CSS. The hook exists so the
// folder reads like every other component in the repo.
export function useRowGrid(props: RowGridProps) {
  return props;
}
