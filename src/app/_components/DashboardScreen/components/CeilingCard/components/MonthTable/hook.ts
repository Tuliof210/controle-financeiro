import type { ScenarioCellsProps } from "./components/ScenarioCells/hook";

// One month, both hypotheses, every figure already a formatted string: the
// arithmetic belongs to the payload and the formatting to CeilingCard's hook.
// The two labels are fixed per column, so they are supplied at the call site
// rather than repeated on every row upstream.
export type MonthRow = {
  key: number;
  label: string;
  isCurrent: boolean;
  ceiling: Omit<ScenarioCellsProps, "spendLabel" | "blockLabel">;
  average: Omit<ScenarioCellsProps, "spendLabel" | "blockLabel">;
};

export type MonthTableProps = { rows: MonthRow[] };

export function useMonthTable(props: MonthTableProps) {
  return props;
}
