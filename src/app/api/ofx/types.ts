// The OFX read model — one uploaded statement file turned into monthly totals.
// Nothing here is persisted: it is produced per request and cached by the
// client in sessionStorage.

// One checking account found in the file. Every field is nullable because OFX
// exports in the wild omit tags the spec marks required.
export type OfxAccount = {
  bankId: string | null;
  accountId: string | null;
  accountType: string | null; // CHECKING / SAVINGS / … verbatim from the file
  balanceCents: number | null; // <LEDGERBAL><BALAMT>
  balanceMonth: number | null; // YYYYMM of <DTASOF>
  start: number | null; // YYYYMM of <DTSTART>
  end: number | null; // YYYYMM of <DTEND>
};

export type OfxMonth = {
  month: number; // YYYYMM
  incomeCents: number; // sum of positive <TRNAMT>, cents, >= 0
  expenseCents: number; // absolute sum of negative <TRNAMT>, cents, >= 0
  balanceCents: number; // income - expense, may be negative
  count: number; // transactions posted in this month
};

export type OfxReport = {
  fileName: string;
  // Hex SHA-256 of the uploaded bytes — the file's identity. Required, not
  // optional: it is what the import flow checks before offering to write, and
  // an optional field would push the undefined case onto every consumer.
  fileHash: string;
  org: string | null; // <FI><ORG>, the institution's name
  fid: string | null;
  currency: string | null; // <CURDEF>, e.g. "BRL"
  accounts: OfxAccount[];
  // Ascending and gap-free: every month from the period start to the period
  // end inclusive, zero-filled where the statement has no transaction.
  months: OfxMonth[];
  totals: {
    incomeCents: number;
    expenseCents: number;
    balanceCents: number;
    count: number;
  };
};
