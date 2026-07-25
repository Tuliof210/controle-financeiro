import type { LimitMonth } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { limitTone } from "../../list-cards.helper";

export type LimitCardProps = {
  limit: { goalCents: number | null; months: LimitMonth[] };
};

export function useLimitCard({ limit }: LimitCardProps) {
  return {
    // No ceiling means nothing to measure against; a column of 0% bars would
    // be a lie, not an empty state. `!goalCents` and not `=== null` on
    // purpose: 0 is a reachable saved value (MoneyInput seeds the field to 0
    // and Save does not block it), the producer already maps it to a null
    // percent, and MonthlyGoalSection renders it as "—".
    empty: !limit.goalCents,
    ceiling: limit.goalCents ? formatMoney(limit.goalCents) : "",
    rows: limit.months.map((month) => {
      const label = formatYyyymm(month.month);
      // Inert by construction, kept only to satisfy the type: the producer
      // emits a null percent exactly when goalCents is falsy, and that is the
      // same condition `empty` above short-circuits on, so these rows are never
      // rendered with it. Mutating the fallback changes nothing observable —
      // there is no test for it because there is no reachable behaviour.
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
