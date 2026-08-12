// The four primitives every OFX parsing bug lives in, kept apart from
// parse.helper.ts so they can be unit-tested directly and so neither file
// crosses the 100-line cap.

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
