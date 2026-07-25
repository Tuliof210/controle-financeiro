import type { DashboardData } from "@/app/api/dashboard/types";

// The "ok" variant only — the screen resolves the other states before rendering
// a board at all, so this component never sees a nullable range.
export type BoardData = Extract<DashboardData, { status: "ok" }>;

export type BoardProps = { data: BoardData };

export function useBoard({ data }: BoardProps) {
  return { data };
}
