import type { BoardData } from "../Board/hook.ts";

interface OverviewProps {
  data: BoardData;
}

// The three `points.map(...)` series that used to be here fed the KPI tiles'
// sparklines only. Those are gone (owner's decision, 2026-08-13), and nothing
// else read them.
function useOverview({ data }: OverviewProps) {
  return { data };
}

export type { OverviewProps };
export { useOverview };
