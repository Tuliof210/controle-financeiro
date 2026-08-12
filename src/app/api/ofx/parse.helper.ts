import { amountToCents, dateToMonth } from "./amount.helper.ts";
import { blocks, leaf } from "./ofx-tags.helper.ts";
import type { OfxAccount } from "./types.ts";

// amountToCents returns null rather than 0 for an unusable amount, and this
// keeps that null rather than turning an absent field into a zero row.
const centsOf = (amount: string | null): number | null => {
  if (!amount) {
    return null;
  }
  return amountToCents(amount);
};

interface OfxTransaction {
  month: number;
  cents: number;
}

interface OfxStatement {
  account: OfxAccount;
  currency: string | null;
  transactions: OfxTransaction[];
}

interface OfxParse {
  org: string | null;
  fid: string | null;
  statements: OfxStatement[];
  // How many <CCSTMTRS> aggregates were seen and skipped. The service uses it
  // to tell "this is a credit-card export" apart from "this is not an OFX".
  cardBlocks: number;
}

// A leaf whose value has to be a month, e.g. <DTSTART> or <DTASOF>.
const monthLeaf = (block: string, tag: string): number | null => {
  const raw = leaf(block, tag);
  if (raw) {
    return dateToMonth(raw);
  }
  return null;
};

function readTransactions(block: string): OfxTransaction[] {
  const found: OfxTransaction[] = [];
  for (const entry of blocks(block, "STMTTRN")) {
    const posted = monthLeaf(entry, "DTPOSTED");
    const raw = leaf(entry, "TRNAMT");
    const cents = centsOf(raw);
    // A row with no usable date or amount cannot be summed into a month, so
    // it is dropped — which is exactly why amountToCents returns null rather
    // than 0, a value that would land in a total as a transaction of nothing.
    if (posted !== null && cents !== null) {
      found.push({ month: posted, cents });
    }
  }
  return found;
}

function readStatement(block: string): OfxStatement {
  const balance = blocks(block, "LEDGERBAL")[0] ?? "";
  const amount = leaf(balance, "BALAMT");
  return {
    account: {
      bankId: leaf(block, "BANKID"),
      accountId: leaf(block, "ACCTID"),
      accountType: leaf(block, "ACCTTYPE"),
      balanceCents: centsOf(amount),
      balanceMonth: monthLeaf(balance, "DTASOF"),
      start: monthLeaf(block, "DTSTART"),
      end: monthLeaf(block, "DTEND"),
    },
    currency: leaf(block, "CURDEF"),
    transactions: readTransactions(block),
  };
}

// Both OFX dialects in one pass: 1.x (SGML) omits leaf closing tags but closes
// its aggregates, and 2.x (XML) closes both — so "<TAG>value up to the next <"
// reads every leaf, and "<TAG>…</TAG>" reads every aggregate.
function parseOfx(text: string): OfxParse {
  return {
    org: leaf(text, "ORG"),
    fid: leaf(text, "FID"),
    // Credit-card statements are out of scope by decision: counted, not read.
    cardBlocks: blocks(text, "CCSTMTRS").length,
    statements: blocks(text, "STMTRS").map(readStatement),
  };
}

export type { OfxParse, OfxTransaction };
export { parseOfx };
