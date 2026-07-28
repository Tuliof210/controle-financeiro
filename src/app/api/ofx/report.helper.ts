import { buildMonths } from "@/lib/months";
import type { OfxParse, OfxTransaction } from "./parse.helper";
import { periodOf } from "./period.helper";
import type { OfxMonth, OfxReport } from "./types";

const blank = (month: number): OfxMonth => ({
  month,
  incomeCents: 0,
  expenseCents: 0,
  balanceCents: 0,
  count: 0,
});

// The sign of <TRNAMT> is the only direction signal, by decision: positive is
// an entrada, negative a saída, whatever the bank called the transaction type.
// An amount of exactly 0 is neither, and only bumps the count.
function totalsByMonth(transactions: OfxTransaction[]): Map<number, OfxMonth> {
  const months = new Map<number, OfxMonth>();
  for (const { month, cents } of transactions) {
    const row = months.get(month) ?? blank(month);
    if (cents > 0) {
      row.incomeCents += cents;
    } else {
      row.expenseCents -= cents;
    }
    row.count += 1;
    row.balanceCents = row.incomeCents - row.expenseCents;
    months.set(month, row);
  }
  return months;
}

const sum = (months: OfxMonth[]) =>
  months.reduce(
    (acc, month) => ({
      incomeCents: acc.incomeCents + month.incomeCents,
      expenseCents: acc.expenseCents + month.expenseCents,
      balanceCents: acc.balanceCents + month.balanceCents,
      count: acc.count + month.count,
    }),
    { incomeCents: 0, expenseCents: 0, balanceCents: 0, count: 0 },
  );

export function buildReport(
  parse: OfxParse,
  fileName: string,
  fileHash: string,
): OfxReport {
  // A multi-account file produces ONE table, by decision; the accounts array
  // is what keeps the composition visible in the header.
  const transactions = parse.statements.flatMap((s) => s.transactions);
  const byMonth = totalsByMonth(transactions);
  const period = periodOf(
    [...byMonth.keys()],
    parse.statements.flatMap(({ account }) => [account.start, account.end]),
  );
  // Gap-free and zero-filled: a month the statement covers but never posted to
  // is a row of zeros, so the hole is visible rather than absent.
  const months = period
    ? buildMonths(period[0], period[1]).map(
        (month) => byMonth.get(month) ?? blank(month),
      )
    : [];

  return {
    // Comes from the upload and is rendered in the UI; no reason to carry an
    // unbounded string.
    fileName: fileName.slice(0, 120),
    fileHash,
    org: parse.org,
    fid: parse.fid,
    currency:
      parse.statements.find((s) => s.currency !== null)?.currency ?? null,
    accounts: parse.statements.map((s) => s.account),
    months,
    // Summed from `months`, so the table's total row and the payload's can
    // never disagree.
    totals: sum(months),
  };
}
