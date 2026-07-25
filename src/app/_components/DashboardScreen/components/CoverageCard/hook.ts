import type { CoverageMonth } from "@/app/api/dashboard/types";
import { formatMoney } from "@/lib/money";
import { formatYyyymm } from "@/lib/months";
import { sharePercent } from "../../list-cards.helper";

export type CoverageCardProps = {
  coverage: {
    committed: number;
    recorded: number;
    percent: number | null;
    months: CoverageMonth[];
  };
};

export function useCoverageCard({ coverage }: CoverageCardProps) {
  return {
    // A null percent means nothing was committed in any elapsed month, so the
    // question does not apply — distinct from "you have recorded nothing".
    empty: coverage.percent === null,
    headline: `${coverage.percent}%`,
    summary: `${formatMoney(coverage.recorded)} lançados de ${formatMoney(coverage.committed)} previstos`,
    rows: coverage.months.map((month) => {
      const label = formatYyyymm(month.month);
      return {
        key: month.month,
        label,
        percent: sharePercent(month.recorded, month.committed),
        gap: formatMoney(month.gap),
        srLabel: `${label}: faltam ${formatMoney(month.gap)} de ${formatMoney(month.committed)} previstos`,
      };
    }),
  };
}
