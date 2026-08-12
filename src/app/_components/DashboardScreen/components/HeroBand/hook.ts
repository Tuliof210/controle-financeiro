import { formatMoney } from "@/lib/money.ts";
import { formatYyyymm } from "@/lib/months.ts";
import type { BoardData } from "../Board/hook.ts";
import { buildFacts, deltaGlyphFor } from "./hero-band.helper.ts";

interface HeroBandProps {
  data?: BoardData;
}

// Pure: it calls no React hook, despite the `use` prefix the convention gives it.
//
// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// six independently nullable fields.
function useHeroBand({ data }: HeroBandProps) {
  if (!data) {
    return { figures: null };
  }

  const { points, range } = data;
  const last = points.at(-1);
  if (!last) {
    return { figures: null };
  }

  // `current` can be missing when the payload and the clock disagree; falling
  // back to the first point keeps the card rendering instead of throwing on
  // `undefined.cumulative`.
  const current =
    points.find((point) => point.month === range.current) ?? points[0];

  return {
    figures: {
      endLabel: formatYyyymm(range.end),
      value: formatMoney(last.cumulative),
      now: formatMoney(current.cumulative),
      delta: formatMoney(last.cumulative - current.cumulative),
      // Drives the ▲/▼ glyph AND the badge tone, so the two can never disagree
      // — README rule 7: meaning is never colour-only.
      deltaUp: last.cumulative >= current.cumulative,
      deltaGlyph: deltaGlyphFor(last.cumulative >= current.cumulative),
      facts: buildFacts(points),
    },
  };
}

export type { HeroBandProps };
export { useHeroBand };
