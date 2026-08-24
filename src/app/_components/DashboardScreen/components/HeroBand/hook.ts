import { formatMoney } from "@/lib/money.ts";
import type { SimulationView } from "@/lib/simulation.ts";
import type { BoardData } from "../Board/hook.ts";
import { buildFigures } from "./hero-figures.helper.ts";
import { useRollingCents } from "./rolling-cents.hook.ts";

interface HeroBandProps {
  data?: BoardData;
  refreshing?: boolean;
  simulation?: SimulationView;
}

// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// independently nullable fields.
function useHeroBand({ data, refreshing, simulation }: HeroBandProps) {
  const figures = buildFigures(data);
  const monthly = useRollingCents(figures?.monthlyCents);
  const weekly = useRollingCents(figures?.weeklyCents);
  const projectedEnd = useRollingCents(figures?.projectedEndCents);
  const now = useRollingCents(figures?.nowCents);
  const delta = useRollingCents(figures?.deltaCents);
  const includesSimulations = simulation === "all";

  if (!figures) {
    return { figures: null, live: false, includesSimulations };
  }

  return {
    live: !refreshing,
    includesSimulations,
    figures: {
      monthLabel: figures.monthLabel,
      monthly,
      weekly: formatMoney(weekly),
      endLabel: figures.endLabel,
      projectedEnd,
      now: formatMoney(now),
      delta,
    },
  };
}

export type { HeroBandProps };
export { useHeroBand };
