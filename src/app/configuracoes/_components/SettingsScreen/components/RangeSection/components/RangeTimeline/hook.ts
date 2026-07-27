import { buildMonths, formatYyyymm } from "@/lib/months";

export type RangeTimelineProps = {
  start: number;
  end: number;
  current: number;
};

// One tick per month of the configured range. `done` months are already
// elapsed (<= current) and draw solid; the rest are projected and draw hatched.
// The caption states the same split in words, so the length, the fill and the
// text all encode one quantity.
//
// Pure on purpose — it calls no React hook, so hook.test.ts exercises it
// directly without a renderer.
export function useRangeTimeline({ start, end, current }: RangeTimelineProps) {
  // buildMonths is inclusive and returns [] for an inverted range, which is
  // reachable: PUT /api/settings only refines rangeEnd >= rangeStart when both
  // are present in the same patch, so a two-step edit can invert it.
  const months = buildMonths(start, end);
  const done = months.filter((month) => month <= current).length;

  return {
    ticks: months.map((month) => ({ month, done: month <= current })),
    caption: `${months.length} ${months.length === 1 ? "mês" : "meses"} · ${done} realizados · ${months.length - done} projetados`,
    srLabel: `Período de ${formatYyyymm(start)} a ${formatYyyymm(end)}: ${done} de ${months.length} meses realizados`,
  };
}
