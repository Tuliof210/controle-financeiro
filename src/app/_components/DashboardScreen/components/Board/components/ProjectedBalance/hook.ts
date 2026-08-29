import { formatMoney } from "@/lib/money.ts";
import type { BoardData } from "../../hook.ts";
import { buildFigures } from "./hero-figures.helper.ts";
import { useRollingCents } from "./rolling-cents.hook.ts";

interface ProjectedBalanceProps {
  data: BoardData;
}

function useProjectedBalance({ data }: ProjectedBalanceProps) {
  const raw = buildFigures(data);
  const value = useRollingCents(raw?.valueCents);
  const now = useRollingCents(raw?.nowCents);
  const delta = useRollingCents(raw?.deltaCents);

  if (!raw) {
    return { figures: null };
  }

  return {
    figures: {
      endLabel: raw.endLabel,
      value,
      now: formatMoney(now),
      delta,
    },
  };
}

export type { ProjectedBalanceProps };
export { useProjectedBalance };
