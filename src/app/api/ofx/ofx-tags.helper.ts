// The four primitives every OFX parsing bug lives in, kept apart from
// parse.helper.ts so they can be unit-tested directly and so neither file
// crosses the 100-line cap.

const MAX_CENTS = 100_000_000_000; // R$ 1 billion, matching src/lib/money.ts

// A leaf element's value. OFX 1.x omits leaf closing tags, so the value runs
// to the next `<`; OFX 2.x closes them, and `[^<]*` stops in the same place.
// Empty or whitespace-only reads as absent.
export function leaf(block: string, tag: string): string | null {
  // Cast because Biome types RegExp.exec as always-matching; it does not.
  const match = new RegExp(`<${tag}>([^<]*)`).exec(
    block,
  ) as RegExpExecArray | null;
  if (match === null) {
    return null;
  }
  const value = match[1].trim();
  return value ? value : null;
}

// Every occurrence of an aggregate's inner text. Aggregates ARE closed in both
// dialects, so one scan serves both.
//
// An indexOf walk rather than a non-greedy regex: `<TAG>([\s\S]*?)</TAG>` is
// quadratic on a file full of unclosed opening tags, since the lazy quantifier
// rescans to EOF once per one — 4.8 MB of repeated <STMTRS> took 48s and
// stalls the whole single-threaded server, which the 5 MB cap does not
// prevent. Linear, and identical to the regex: nearest close wins, the search
// resumes past it, an unclosed aggregate ends the scan.
export function blocks(text: string, tag: string): string[] {
  const open = `<${tag}>`;
  const close = `</${tag}>`;
  const found: string[] = [];
  let at = text.indexOf(open);
  while (at !== -1) {
    const from = at + open.length;
    const end = text.indexOf(close, from);
    if (end === -1) {
      break;
    }
    found.push(text.slice(from, end));
    at = text.indexOf(open, end + close.length);
  }
  return found;
}

// "-1234.56" | "1.234,56" | "1234" -> integer cents. Whichever of `.` or `,`
// comes LAST is the decimal separator; any earlier one is a thousands mark
// banks add against the spec. Digits are read as strings so no float rounds.
// Unparseable input returns null rather than 0 — a silent 0 would land in a
// total as a real transaction of nothing.
//
// One input stays genuinely ambiguous: a lone separator followed by exactly
// three digits ("1.234"). The OFX spec allows only a decimal point and no
// grouping at all, so it is read as 1 real 23 centavos — a bank would have to
// be off-spec twice, using `.` for thousands AND dropping the centavos, for
// that to be the wrong call. No heuristic guards it; a heuristic that guesses
// wrong on real money is worse than a rule the reader can predict.
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
    Number(whole) * 100 + Number(fraction.padEnd(2, "0").slice(0, 2));
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
  const digits = raw.replace(/\D/g, "").slice(0, 6);
  if (digits.length < 6) {
    return null;
  }
  const month = Number(digits);
  const inYear = month % 100 >= 1 && month % 100 <= 12;
  return inYear && month >= 190_001 && month <= 999_912 ? month : null;
}
