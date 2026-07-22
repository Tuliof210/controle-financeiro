// cents -> "1234,56". padStart(3) guarantees at least "0,0X".
// ponytail: no thousands grouping; add a "." grouper in formatCents when large goals need it.
export const formatCents = (cents: number): string => {
  const s = String(Math.abs(Math.trunc(cents))).padStart(3, "0");
  return `${s.slice(0, -2)},${s.slice(-2)}`;
};

// any string -> cents, keeping ONLY 0-9 (mask/comma/paste-junk stripped).
const MAX_CENTS = 1_000_000_000_00; // R$ 1 trillion guard against overflow
export const digitsToCents = (raw: string): number => {
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  return Math.min(parseInt(digits || "0", 10), MAX_CENTS);
};
