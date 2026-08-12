import type { OfxMonth } from "@/app/api/ofx/types.ts";
import type { TotalsRowProps } from "./components/TotalsRow/hook.ts";

export type MonthTableProps = {
  rows: OfxMonth[];
  totals: TotalsRowProps;
};

// A pass-through, like UploadCard's: useReportView already shaped both halves,
// and the table exists as its own component because its markup and styles are
// what pushed ReportView past the file cap, not because it needs logic.
export function useMonthTable({ rows, totals }: MonthTableProps) {
  return { rows, totals };
}
