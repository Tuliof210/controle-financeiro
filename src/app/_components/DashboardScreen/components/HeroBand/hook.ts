import { formatMoney } from "@/lib/money.ts";
import type { BoardData } from "../Board/hook.ts";
import { buildFigures } from "./hero-figures.helper.ts";
import { useRollingCents } from "./rolling-cents.hook.ts";

interface HeroBandProps {
  data?: BoardData;
  refreshing?: boolean;
}

// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// independently nullable fields.
function useHeroBand({ data, refreshing }: HeroBandProps) {
  const figures = buildFigures(data);
  const value = useRollingCents(figures?.valueCents);
  const now = useRollingCents(figures?.nowCents);
  const delta = useRollingCents(figures?.deltaCents);

  if (!figures) {
    return { figures: null, live: false };
  }

  return {
    live: !refreshing,
    figures: {
      endLabel: figures.endLabel,
      value,
      now: formatMoney(now),
      delta,
    },
  };
}

export type { HeroBandProps };
export { useHeroBand };
