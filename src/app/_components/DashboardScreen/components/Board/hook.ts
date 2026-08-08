import type { DashboardData } from "@/app/api/dashboard/types";
import type { CeilingCap } from "@/lib/ceiling-caps";

// The "ok" variant only — the screen resolves the other states before rendering
// a board at all, so this component never sees a nullable range.
export type BoardData = Extract<DashboardData, { status: "ok" }>;

// The cap only passes through: the selector that sets it belongs on the ceiling
// card, but what it changes reaches SavingsSection too, so the state itself
// lives one level above this.
export type BoardProps = {
  data: BoardData;
  cap: CeilingCap;
  onCapChange: (cap: CeilingCap) => void;
};

export function useBoard({ data, cap, onCapChange }: BoardProps) {
  return {
    data,
    cap,
    onCapChange,
    ceiling: data.ceiling,
    meta: data.meta,
    // CeilingCard marks a month as projected by comparing it to this. It lives
    // on the range, not on the rows, so the board is the one place reading it.
    current: data.range.current,
  };
}
