import type { BoardData } from "../Board/hook.ts";
import { buildFacts } from "./period-facts.helper.ts";

export interface OverviewAreas {
  facts: string;
  bars: string;
  line: string;
}

export interface OverviewProps {
  data: BoardData;
  areas?: OverviewAreas;
}

const NONE: OverviewAreas = { facts: "", bars: "", line: "" };

export function useOverview({ data, areas = NONE }: OverviewProps) {
  return {
    data,
    facts: buildFacts(data.points),
    areas,
  };
}
