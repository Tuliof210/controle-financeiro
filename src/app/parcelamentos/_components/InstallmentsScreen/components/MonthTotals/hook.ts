import type { Recurrence } from "@/core/entities/recurrence.entity";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { monthTotals } from "../../month-totals.helper";

export type MonthTotalsProps = {
  purchases: Recurrence[];
};

export function useMonthTotals({ purchases }: MonthTotalsProps) {
  return {
    rows: monthTotals(purchases).map((entry) => ({
      month: entry.month,
      label: formatYyyymm(entry.month),
      count: `${entry.purchases} ${entry.purchases === 1 ? "compra" : "compras"}`,
      total: formatMoney(entry.totalCents),
    })),
  };
}
