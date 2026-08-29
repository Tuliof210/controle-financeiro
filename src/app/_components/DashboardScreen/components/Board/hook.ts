import type { DashboardData } from "@/app/api/dashboard/types.ts";
import type { OverviewAreas } from "../Overview/hook.ts";
import styles from "./style.module.scss";

export type BoardData = Extract<DashboardData, { status: "ok" }>;

export interface BoardProps {
  data: BoardData;
}

export function useBoard({ data }: BoardProps) {
  const areas: OverviewAreas = {
    facts: styles.facts,
    bars: styles.bars,
    line: styles.line,
  };

  return {
    data,
    areas,
    ceiling: data.ceiling,
    // CeilingCard marks a month as projected by comparing it to this. It lives
    // on the range, not on the rows, so the board is the one place reading it.
    current: data.range.current,
  };
}
