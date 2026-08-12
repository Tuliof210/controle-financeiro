import type { OfxAccount, OfxReport } from "@/app/api/ofx/types.ts";

// The report both ImportAction suites drive. Not a `*.test.ts`, so testMatch
// leaves it alone.
const account = { accountId: "12345-6" } as OfxAccount;

const report: OfxReport = {
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  fid: "1",
  currency: "BRL",
  accounts: [account],
  months: [
    {
      month: 202_608,
      incomeCents: 1000,
      expenseCents: 400,
      balanceCents: 600,
      count: 2,
    },
  ],
  totals: {
    incomeCents: 1000,
    expenseCents: 400,
    balanceCents: 600,
    count: 2,
  },
};

const people = [{ id: "p1", name: "Ana", color: "violet" }];

export { people, report };
