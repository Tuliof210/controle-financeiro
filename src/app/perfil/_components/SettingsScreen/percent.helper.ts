// The "não passa de 100" of R2/R3, in one place. Digits only — the input is a
// plain text Field (FieldProps has no percent arm), so a paste can carry a
// comma, a sign or a "%" — then saturated into 0..100 rather than refused: the
// owner's answer was "trava no máximo", so typing past the ceiling simply does
// not advance the value.
const MAX_PERCENT = 100;

export function clampPercent(raw: string): number {
  const digits = raw.replace(/\D/g, "");
  return Math.min(Number.parseInt(digits || "0", 10), MAX_PERCENT);
}

export { MAX_PERCENT };
