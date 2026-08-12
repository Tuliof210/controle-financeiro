import { MAX_CENTS } from "@/lib/money.ts";

// OFX amounts carry two decimals, and <DTPOSTED> opens with the six YYYYMM
// digits this app already speaks.
const CENTS_PER_UNIT = 100;
const DECIMALS = 2;
const YYYYMM_DIGITS = 6;
const YEAR_SHIFT = 100;
const FIRST_MONTH = 1;
const LAST_MONTH = 12;
const MONTH_MIN = 190_001;
const MONTH_MAX = 999_912;

const AMOUNT = /^([+-]?)(\d+)(?:\.(\d*))?$/;

export function amountToCents(raw: string): number | null {
  const cleaned = raw.replace(/\s/g, "");
  const cut = Math.max(cleaned.lastIndexOf("."), cleaned.lastIndexOf(","));
  const normalized =
    cut < 0
      ? cleaned
      : `${cleaned.slice(0, cut).replace(/[.,]/g, "")}.${cleaned.slice(cut + 1)}`;
  const match = AMOUNT.exec(normalized);
  if (!match) {
    return null;
  }
  const [, sign, whole, fraction = ""] = match;
  // OFX amounts carry two decimals; a third digit is truncated, not rounded.
  const cents =
    Number(whole) * CENTS_PER_UNIT +
    Number(fraction.padEnd(DECIMALS, "0").slice(0, DECIMALS));
  // The same R$ 1 billion ceiling src/lib/money.ts guards with — there it
  // clamps, here it drops the row, this function's existing failure mode. Past
  // MAX_SAFE_INTEGER cents stop being exact in a float64, so one absurd row
  // absorbs every real one in the month's total while the count claims both.
  if (Math.abs(cents) > MAX_CENTS) {
    return null;
  }
  return sign === "-" ? -cents : cents;
}

// <DTPOSTED> is YYYYMMDD[HHMMSS][[-3:BRT]] — the first six digits already ARE
// the YYYYMM this whole app uses. Anything that is not a valid month returns
// null and the transaction is dropped.
export function dateToMonth(raw: string): number | null {
  const digits = raw.replace(/\D/g, "").slice(0, YYYYMM_DIGITS);
  if (digits.length < YYYYMM_DIGITS) {
    return null;
  }
  const month = Number(digits);
  const inYear =
    month % YEAR_SHIFT >= FIRST_MONTH && month % YEAR_SHIFT <= LAST_MONTH;
  return inYear && month >= MONTH_MIN && month <= MONTH_MAX ? month : null;
}
