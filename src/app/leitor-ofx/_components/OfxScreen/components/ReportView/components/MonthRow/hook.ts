import type { OfxMonth } from "@/app/api/ofx/types";
import { formatCents, formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";

export type MonthRowProps = { month: OfxMonth };

export function useMonthRow({ month }: MonthRowProps) {
  const label = formatYyyymm(month.month);

  return {
    label,
    income: formatMoney(month.incomeCents),
    expense: formatMoney(month.expenseCents),
    balance: formatMoney(month.balanceCents),
    count: month.count,
    // The column headers already name each value and formatMoney prefixes a
    // U+2212 on negatives, so the colour reinforces the sign rather than
    // carrying it — README rule 7, meaning is never colour-only.
    negative: month.balanceCents < 0,
    // formatCents, NOT formatMoney: unsigned and ungrouped is exactly what
    // MoneyInput accepts on paste, since digitsToCents keeps only the digits —
    // so "4312,50" lands as R$ 4.312,50 with nothing left to edit. null means
    // "render no button": the table is zero-filled by design, and a copy
    // button on R$ 0,00 offers nothing.
    copyIncome: month.incomeCents > 0 ? formatCents(month.incomeCents) : null,
    copyExpense:
      month.expenseCents > 0 ? formatCents(month.expenseCents) : null,
    // Named per row: twelve rows of two buttons all announced as "Copiar" is
    // unusable with a screen reader.
    copyIncomeLabel: `Copiar entradas de ${label}`,
    copyExpenseLabel: `Copiar saídas de ${label}`,
  };
}
