import type { BoardData } from "../Board/hook";

export type ProjectionTabProps = { data: BoardData };

export function useProjectionTab({ data }: ProjectionTabProps) {
  return {
    ceiling: data.ceiling,
    // The card marks a month as projected by comparing it to this. It lives on
    // the range, not on the rows, so the tab is the one place that reads it.
    current: data.range.current,
  };
}
