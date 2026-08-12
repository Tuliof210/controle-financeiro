// cents -> "1234,56". padStart(3) guarantees at least "0,0X".
// Sign-less and ungrouped ON PURPOSE: MoneyInput reformats its value on every
// keystroke and its caret handlers depend on this exact output. formatMoney
// below is the grouped, signed variant every display site uses.
// (This retires the old "ponytail: add a '.' grouper when large goals need it"
// note — the grouper now exists as formatMoney, so the deferral is closed.)
// "0,0X" needs three digits before the comma is inserted; a real is 100 cents,
// a thousand reais 100_000, and one tenth of that is the K formatter's step.
const MIN_DIGITS = 3;
const CENTS_IN_TENTH_OF_K = 10_000;
const TENTHS = 10;

const formatCents = (cents: number): string => {
  const s = String(Math.abs(Math.trunc(cents))).padStart(MIN_DIGITS, "0");
  return `${s.slice(0, -2)},${s.slice(-2)}`;
};

// "1234" -> "1.234" (pt-BR thousands grouping).
const group = (digits: string): string =>
  digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// U+2212 MINUS SIGN, matching the DS money pattern in src/styles/docs/Colors.mdx.
const sign = (cents: number): string => (cents < 0 ? "−" : "");

// cents -> "R$ 1.234,56" / "−R$ 640,00". The display formatter: signed and
// grouped, unlike formatCents.
const formatMoney = (cents: number): string => {
  const [whole, fraction] = formatCents(cents).split(",");
  return `${sign(cents)}R$ ${group(whole)},${fraction}`;
};

// cents -> "R$ 1.234", dropping the cents (truncated toward zero, never
// rounded up). For chart axis labels, where two decimals are noise.
const formatMoneyShort = (cents: number): string =>
  `${sign(cents)}R$ ${group(formatCents(cents).split(",")[0])}`;

// cents -> "R$ 12,3K" / "R$ 20K" / "−R$ 2,8K": thousands of reais, one
// decimal, truncated (never rounded up, matching formatCents), the decimal
// dropped when it is zero. For chart Y axis labels on mobile, where
// formatMoneyShort's full grouped digits ("R$ 12.345") are too wide.
const formatMoneyShortK = (cents: number): string => {
  const tenthsOfK = Math.trunc(Math.abs(cents) / CENTS_IN_TENTH_OF_K);
  const whole = Math.trunc(tenthsOfK / TENTHS);
  const tenth = tenthsOfK % TENTHS;
  return `${sign(cents)}R$ ${tenth === 0 ? whole : `${whole},${tenth}`}K`;
};

// any string -> cents, keeping ONLY 0-9 (mask/comma/paste-junk stripped).
// Exported so a handler validating cents can reject at the same ceiling the
// input itself enforces, instead of inventing a second one.
const MAX_DIGITS = 15;
const MAX_CENTS = 100_000_000_000; // R$ 1 billion guard against overflow
const digitsToCents = (raw: string): number => {
  const digits = raw.replace(/\D/g, "").slice(0, MAX_DIGITS);
  return Math.min(Number.parseInt(digits || "0", 10), MAX_CENTS);
};

export {
  digitsToCents,
  formatCents,
  formatMoney,
  formatMoneyShort,
  formatMoneyShortK,
  MAX_CENTS,
};
