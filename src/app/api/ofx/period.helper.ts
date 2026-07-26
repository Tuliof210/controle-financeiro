import { addMonths } from "@/lib/months";

const MAX_SPAN = 240; // 20 years of rows

// Months are YYYYMM ints, so "does this range fit" is one addMonths call — and
// notably NOT buildMonths(...).length, which is the very thing being guarded.
const fits = (start: number, end: number) =>
  addMonths(start, MAX_SPAN - 1) >= end;

// Which months the report renders, inclusive. `months` are the months the
// transactions actually posted in; `declared` are the <DTSTART>/<DTEND> bounds
// every statement announced, nulls included.
export function periodOf(
  months: number[],
  declared: (number | null)[],
): [number, number] | null {
  const bounds = [...months, ...declared.filter((value) => value !== null)];
  if (bounds.length === 0) {
    return null;
  }

  // Widest first: the declared window widened to cover every transaction, so
  // an export whose rows fall outside its own <DTSTART>/<DTEND> loses nothing.
  const wide: [number, number] = [Math.min(...bounds), Math.max(...bounds)];
  if (fits(...wide)) {
    return wide;
  }

  // A bound is corrupt — a <DTEND> of 99991231 asks buildMonths for ~950k rows
  // and hangs the request. The transactions' own dates are the only ones a
  // bank actually wrote, so they win outright; the declared window is dropped
  // rather than clamped, because clamping anchors on the corrupt end and would
  // drop the real data instead.
  if (months.length === 0) {
    return null;
  }
  const end = Math.max(...months);
  // ponytail: if even the transactions span more than MAX_SPAN, keep the most
  // recent ones. Widen MAX_SPAN if a real statement ever covers 20+ years.
  return [Math.max(Math.min(...months), addMonths(end, 1 - MAX_SPAN)), end];
}
