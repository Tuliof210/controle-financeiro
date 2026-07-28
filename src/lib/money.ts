// cents -> "1234,56". padStart(3) guarantees at least "0,0X".
// Sign-less and ungrouped ON PURPOSE: MoneyInput reformats its value on every
// keystroke and its caret handlers depend on this exact output. formatMoney
// below is the grouped, signed variant every display site uses.
// (This retires the old "ponytail: add a '.' grouper when large goals need it"
// note — the grouper now exists as formatMoney, so the deferral is closed.)
export const formatCents = (cents: number): string => {
  const s = String(Math.abs(Math.trunc(cents))).padStart(3, "0");
  return `${s.slice(0, -2)},${s.slice(-2)}`;
};

// "1234" -> "1.234" (pt-BR thousands grouping).
const group = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// U+2212 MINUS SIGN, matching the DS money pattern in src/styles/docs/Colors.mdx.
const sign = (cents: number): string => (cents < 0 ? "−" : "");

// cents -> "R$ 1.234,56" / "−R$ 640,00". The display formatter: signed and
// grouped, unlike formatCents.
export const formatMoney = (cents: number): string => {
  const [whole, fraction] = formatCents(cents).split(",");
  return `${sign(cents)}R$ ${group(whole)},${fraction}`;
};

// cents -> "R$ 1.234", dropping the cents (truncated toward zero, never
// rounded up). For chart axis labels, where two decimals are noise.
export const formatMoneyShort = (cents: number): string =>
  `${sign(cents)}R$ ${group(formatCents(cents).split(",")[0])}`;

// cents -> "R$ 12,3K" / "R$ 20K" / "−R$ 2,8K": thousands of reais, one
// decimal, truncated (never rounded up, matching formatCents), the decimal
// dropped when it is zero. For chart Y axis labels on mobile, where
// formatMoneyShort's full grouped digits ("R$ 12.345") are too wide.
export const formatMoneyShortK = (cents: number): string => {
  const tenthsOfK = Math.trunc(Math.abs(cents) / 10_000);
  const whole = Math.trunc(tenthsOfK / 10);
  const tenth = tenthsOfK % 10;
  return `${sign(cents)}R$ ${tenth === 0 ? whole : `${whole},${tenth}`}K`;
};

// any string -> cents, keeping ONLY 0-9 (mask/comma/paste-junk stripped).
const MAX_CENTS = 1_000_000_000_00; // R$ 1 billion guard against overflow
export const digitsToCents = (raw: string): number => {
  const digits = raw.replace(/\D/g, "").slice(0, 15);
  return Math.min(parseInt(digits || "0", 10), MAX_CENTS);
};
