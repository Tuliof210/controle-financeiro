import type { DashboardData } from "@/app/api/dashboard/types";
import type { DashboardTab } from "../../hook";

// The "ok" variant only — the screen resolves the other states before rendering
// a board at all, so this component never sees a nullable range.
export type BoardData = Extract<DashboardData, { status: "ok" }>;

export type BoardProps = {
  data: BoardData;
  tab: DashboardTab;
  onSelect: (id: DashboardTab) => void;
};

const LABELS: [DashboardTab, string][] = [
  ["geral", "Visão geral"],
  ["projecao", "Projeção"],
  ["metas", "Metas"],
];

export function useBoard({ data, tab, onSelect }: BoardProps) {
  return {
    data,
    tab,
    onSelect,
    tabs: LABELS.map(([id, label]) => ({ id, label, active: id === tab })),
  };
}
