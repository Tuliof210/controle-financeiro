import type { CeilingMonth } from "@/app/api/dashboard/ceiling.types.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import { tipFor } from "./line-tip.helper.ts";

// One point of the curve, with the caption the bubble prints for it.
// Greyscale: the dash and the ESTIMADO word carry "projection"; opacity is extra.
const tagFor = (projected: boolean): string => {
  if (projected) {
    return "estimado";
  }
  return "real";
};

interface At {
  cx: number;
  cy: number;
}

function dotFor(
  point: MonthPoint,
  projected: boolean,
  at: At,
  ceilingLeft?: number,
) {
  const label = formatYyyymm(point.month);
  const value = formatMoney(point.cumulative);

  return {
    key: `${point.month}-cumulative`,
    ...at,
    projected,
    stroke: "var(--color-brand)",
    tip: tipFor(point.month, at.cx, tagFor(projected), {
      cumulative: point.cumulative,
      ceilingLeft,
    }),
    title: `${label} · acumulado ${value}`,
  };
}

function tetoDotFor(
  row: CeilingMonth,
  projected: boolean,
  at: At,
  cumulative: number,
) {
  const label = formatYyyymm(row.month);
  const value = formatMoney(row.ceilingLeft);

  return {
    key: `${row.month}-teto`,
    ...at,
    projected,
    stroke: "var(--color-text-secondary)",
    tip: tipFor(row.month, at.cx, tagFor(projected), {
      cumulative,
      ceilingLeft: row.ceilingLeft,
    }),
    title: `${label} · se gastar o teto ${value}`,
  };
}

export { dotFor, tagFor, tetoDotFor };
