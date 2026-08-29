import { formatYyyymm } from "@/lib/months.ts";
import type { BoardData } from "../../hook.ts";

// The card's numbers in CENTS, split off `hook.ts` so the derivation stays
// pure while the hook beside it owns the React part. It returns raw values
// rather than formatted strings because every money figure is walked between
// payloads (`rolling-cents.hook.ts`) — a pre-formatted string has nothing
// to interpolate.
function buildFigures(data?: BoardData) {
  if (!data) {
    return null;
  }

  const { points, range } = data;
  const last = points.at(-1);
  if (!last) {
    return null;
  }

  // `current` can be missing when the payload and the clock disagree; falling
  // back to the first point keeps the card rendering instead of throwing on
  // `undefined.cumulative`.
  const current =
    points.find((point) => point.month === range.current) ?? points[0];

  return {
    endLabel: formatYyyymm(range.end),
    valueCents: last.cumulative,
    nowCents: current.cumulative,
    deltaCents: last.cumulative - current.cumulative,
  };
}

export { buildFigures };
