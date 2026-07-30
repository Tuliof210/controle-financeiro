import type { DashboardData } from "@/app/api/dashboard/types";

// The "ok" variant only — the screen resolves the other states before rendering
// a board at all, so this component never sees a nullable range.
export type BoardData = Extract<DashboardData, { status: "ok" }>;

export type BoardProps = { data: BoardData };

export function useBoard({ data }: BoardProps) {
  return {
    data,
    ceiling: data.ceiling,
    // CeilingCard marks a month as projected by comparing it to this. It lives
    // on the range, not on the rows, so the board is the one place reading it.
    current: data.range.current,
  };
}
