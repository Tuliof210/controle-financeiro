import type { CeilingCap } from "@/lib/ceiling-caps.ts";
import type { BoardData } from "../Board/hook.ts";
import { buildFacts } from "./hero-band.helper.ts";
import { verdictFor } from "./hero-verdict.helper.ts";

// `cap` rides along because the band's headline IS the ceiling now, and which
// limit bound that figure depends on the cap the reader picked. It is screen
// state, not payload, which is why it arrives as its own prop.
interface HeroBandProps {
  data?: BoardData;
  cap: CeilingCap;
}

// Pure: it calls no React hook, despite the `use` prefix the convention gives it.
//
// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// several independently nullable fields.
//
// The headline is `ceiling.monthly` — how much can be spent this month without any
// later month closing negative. It used to be `points.at(-1).cumulative`, a
// projection at the far end of the range: the loudest figure on the page was the
// one least useful for the decision the page exists to support, and the figure
// that WAS useful sat 2.39 viewports below the fold.
function useHeroBand({ data, cap }: HeroBandProps) {
  if (!data) {
    return { figures: null };
  }

  const { points, range, ceiling, meta } = data;
  if (points.length === 0) {
    return { figures: null };
  }

  return {
    figures: {
      value: ceiling.monthly,
      verdict: verdictFor(ceiling, meta, cap),
      facts: buildFacts(points, range),
    },
  };
}

export type { HeroBandProps };
export { useHeroBand };
