// One month, every figure already a formatted string: the arithmetic belongs to
// the payload and the formatting to CeilingCard's hook.
import type { CSSProperties } from "react";

export interface MonthRow {
  key: number;
  label: string;
  isCurrent: boolean;
  balance: string; // the balance arriving at the month
  spend: string; // this month's ceiling
  left: string; // what is left once it has been spent
  share: number; // spend / balance, already clamped to [0, 1]
}

export interface MonthTableProps {
  rows: MonthRow[];
}

export function useMonthTable({ rows }: MonthTableProps) {
  return {
    // The share reaches CSS as a custom property on the row, because the row
    // itself paints the bar — a `<div>` inside a `<tr>` is not valid table
    // markup, and any new child would break the positional cell read in
    // `e2e/ceiling-page.helper.ts`. The cast is what TypeScript needs to accept
    // a custom property in a style object; it is written once, here.
    rows: rows.map((row) => ({
      ...row,
      style: { "--share": `${row.share * 100}%` } as CSSProperties,
    })),
  };
}
