import { formatMoney } from "@/lib/money.ts";
import type { BoardData } from "../Board/hook.ts";
import { deltaGlyphFor } from "./hero-band.helper.ts";
import { buildFigures } from "./hero-figures.helper.ts";
import { useRollingCents } from "./rolling-cents.hook.ts";

interface HeroBandProps {
  data?: BoardData;
}

// `figures` is null in every state but `ok`. The band's title half is static
// copy and renders while the payload is loading, missing or in error — only the
// numbers wait for it, which is why they are one nullable object rather than
// six independently nullable fields.
//
// The three useRollingCents calls sit ABOVE that guard and go `undefined` for
// the no-payload case: a hook cannot be called conditionally, and the optional
// chain is also what tells the hook there is nothing to walk from yet.
function useHeroBand({ data }: HeroBandProps) {
  const figures = buildFigures(data);
  const value = useRollingCents(figures?.valueCents);
  const now = useRollingCents(figures?.nowCents);
  const delta = useRollingCents(figures?.deltaCents);

  if (!figures) {
    return { figures: null };
  }

  // Read off the ROLLING delta, not the payload's: mid-flight the sign the
  // glyph claims and the sign the figure shows have to be the same one. They
  // agree at every frame because all three figures share one curve.
  const deltaUp = delta >= 0;

  return {
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
