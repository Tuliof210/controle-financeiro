import type { Ceiling, CeilingTarget } from "./ceiling.types.ts";

// The same union the Teto uses, under its own name: the two adjustments are
// saved separately on the `Settings` row and read the same two ways, and a
// shared alias is what keeps a caller from handing one to the other.
type GoalsTarget = CeilingTarget;

const PERCENT = 100;

// A share of THIS MONTH's teto — the figure the Teto de Gastos card displays —
// so the two cards compose: 50% of a R$40 teto is R$20. Flooring a share always
// rounds DOWN. Never Math.trunc: it differs on negatives.
//
// A fixed amount is returned as it stands, with no clamp against the ceiling it
// is meant to come out of. An unreachable rate is the family's own figure read
// back to them; silently lowering it would leave the goal dates looking
// affordable. The Perfil input is what caps a typed amount at this month's teto.
//
// A period with no room at all makes monthly 0 and so the pace 0, which
// goals.helper already treats as "no rate".
//
// Its own file rather than ceiling.helper's: this is what the ceiling BUYS, not
// how it is computed, and folding it back in puts that file over the 100-line
// cap.
function savingPace(ceiling: Ceiling, target: GoalsTarget): number {
  if (target.mode === "fixed") {
    return target.cents;
  }
  return Math.floor((ceiling.monthly * target.percent) / PERCENT);
}

export type { GoalsTarget };
export { savingPace };
