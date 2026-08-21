import { formatMoney } from "@/lib/money.ts";
import type { BoardData } from "../Board/hook.ts";
import { deltaGlyphFor } from "./hero-band.helper.ts";
import { buildFigures } from "./hero-figures.helper.ts";
import { useRollingCents } from "./rolling-cents.hook.ts";

interface HeroBandProps {
  data?: BoardData;
  refreshing?: boolean;
}

// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// six independently nullable fields.
//
// The three useRollingCents calls sit ABOVE that guard and go `undefined` for
// the no-payload case: a hook cannot be called conditionally, and the optional
// chain is also what tells the hook there is nothing to walk from yet.
function useHeroBand({ data, refreshing }: HeroBandProps) {
  const figures = buildFigures(data);
  const value = useRollingCents(figures?.valueCents);
  const now = useRollingCents(figures?.nowCents);
  const delta = useRollingCents(figures?.deltaCents);

  // Is the answer on screen the current one? Two ways for it not to be, and the
  // caret reports both as one state: there is no payload yet (or the status is
  // not `ok`), or the figures showing are a previous request's while the next
  // is in flight. The board below already dims for the second; the band, which
  // sits outside that wrapper, said nothing at all until now.
  if (!figures) {
    return { figures: null, live: false };
  }

  // Read off the ROLLING delta, not the payload's: mid-flight the sign the
  // glyph claims and the sign the figure shows have to be the same one. They
  // agree at every frame because all three figures share one curve.
  const deltaUp = delta >= 0;

  return {
    live: !refreshing,
    figures: {
      endLabel: figures.endLabel,
      facts: figures.facts,
      value,
      now: formatMoney(now),
      delta: formatMoney(delta),
      // Drives the ▲/▼ glyph AND the badge tone, so the two can never disagree
      // — README rule 7: meaning is never colour-only.
      deltaUp,
      deltaGlyph: deltaGlyphFor(deltaUp),
    },
  };
}

export type { HeroBandProps };
export { useHeroBand };
