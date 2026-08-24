import type { BoardData } from "../Board/hook.ts";

export interface OverviewProps {
  data: BoardData;
}

export function useOverview({ data }: OverviewProps) {
  return { data };
}
