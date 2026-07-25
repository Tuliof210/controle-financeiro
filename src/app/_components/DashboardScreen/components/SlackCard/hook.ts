import type { SlackMonth } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { sharePercent } from "../../list-cards.helper";

export type SlackCardProps = { slack: SlackMonth[] };

export function useSlackCard({ slack }: SlackCardProps) {
  // The meter is relative to the roomiest month, so the shape of the runway is
  // visible at a glance. Math.max(0, ...) also covers the empty list.
  const max = Math.max(0, ...slack.map((month) => month.total));

  return {
    // Every total at 0 means the projected balance never covers a single extra
    // real — a list of empty bars would say that worse than a sentence.
    empty: max === 0,
    rows: slack.map((month) => {
      const label = formatYyyymm(month.month);
      return {
        key: month.month,
        label,
        percent: sharePercent(month.total, max),
        total: formatMoney(month.total),
        weekly: formatMoney(month.weekly),
        daily: formatMoney(month.daily),
        srLabel: `${label}: ${formatMoney(month.total)} seguros para gastar`,
      };
    }),
  };
}
