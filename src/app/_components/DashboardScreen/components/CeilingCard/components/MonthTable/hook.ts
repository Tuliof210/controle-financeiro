// One month, every figure already a formatted string: the arithmetic belongs to
// the payload and the formatting to CeilingCard's hook.
import type { CSSProperties } from "react";

interface MonthRow {
  key: number;
  label: string;
  isCurrent: boolean;
  balance: string; // the balance arriving at the month
  spend: string; // this month's ceiling
  left: string; // what is left once it has been spent
  share: number; // spend / balance, already clamped to [0, 1]
}

interface MonthTableProps {
  rows: MonthRow[];
  // What ShowAllToggle's aria-controls points at. The string comes from
  // `DashboardScreen/ids.ts` so the two ends cannot drift.
  id: string;
}

const PERCENT = 100;

function useMonthTable({ rows, id }: MonthTableProps) {
  return {
    id,
    // The share reaches CSS as a custom property on the row, because the row
    // itself paints the bar — a `<div>` inside a `<tr>` is not valid table
    // markup, and any new child would break the positional cell read in
    // `e2e/ceiling-page.helper.ts`. The cast is what TypeScript needs to accept
    // a custom property in a style object; it is written once, here.
    rows: rows.map((row) => ({
      ...row,
      style: { "--share": `${row.share * PERCENT}%` } as CSSProperties,
    })),
  };
}

export type { MonthRow, MonthTableProps };
export { useMonthTable };
