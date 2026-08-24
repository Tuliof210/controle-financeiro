// Pure comparison: the amount in cents against this month's ceiling. The UI
// owns the empty/zero field — this helper does not call that "cabe".

export type AffordResult =
  | { ok: true; remainingCents: number }
  | { ok: false; shortfallCents: number };

export function canAfford(
  amountCents: number,
  ceilingMonthlyCents: number,
): AffordResult {
  const remainingCents = ceilingMonthlyCents - amountCents;
  if (remainingCents >= 0) {
    return { ok: true, remainingCents };
  }
  return { ok: false, shortfallCents: -remainingCents };
}
