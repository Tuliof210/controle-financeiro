import type { OfxMonth } from "@/app/api/ofx/types.ts";
import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";

export type MonthRowProps = { month: OfxMonth };

export function useMonthRow({ month }: MonthRowProps) {
  return {
    label: formatYyyymm(month.month),
    income: formatMoney(month.incomeCents),
    expense: formatMoney(month.expenseCents),
    balance: formatMoney(month.balanceCents),
    count: month.count,
    // The column headers already name each value and formatMoney prefixes a
    // U+2212 on negatives, so the colour reinforces the sign rather than
    // carrying it — README rule 7, meaning is never colour-only.
    negative: month.balanceCents < 0,
  };
}
