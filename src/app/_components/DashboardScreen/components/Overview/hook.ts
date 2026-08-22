import type { BoardData } from "../Board/hook.ts";
import { buildFacts } from "./period-facts.helper.ts";

export interface OverviewProps {
  data: BoardData;
}

export function useOverview({ data }: OverviewProps) {
  return {
    data,
    facts: buildFacts(data.points),
  };
}
