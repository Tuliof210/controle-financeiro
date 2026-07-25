import type { LimitMonth } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { limitTone } from "../../list-cards.helper";

export type LimitCardProps = {
  limit: { goalCents: number | null; months: LimitMonth[] };
};

export function useLimitCard({ limit }: LimitCardProps) {
  return {
    // No ceiling saved means there is nothing to measure against; a column of
    // 0% bars would be a lie, not an empty state.
    empty: limit.goalCents === null,
    ceiling: limit.goalCents === null ? "" : formatMoney(limit.goalCents),
    rows: limit.months.map((month) => {
      const label = formatYyyymm(month.month);
      const percent = month.percent ?? 0;
      return {
        key: month.month,
        label,
        percent,
        tone: limitTone(month.percent),
        // The text is never clamped: a 240% month has to read as 240%.
        percentText: `${percent}%`,
        spent: formatMoney(month.spent),
        srLabel: `${label}: ${formatMoney(month.spent)}, ${percent}% da meta`,
      };
    }),
  };
}
