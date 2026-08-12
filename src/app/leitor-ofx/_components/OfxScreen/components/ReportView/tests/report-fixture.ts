import type { OfxAccount, OfxReport } from "@/app/api/ofx/types.ts";

// The report the ReportView suites drive. Not a `*.test.ts`, so testMatch
// leaves it alone.
const account = (over: Partial<OfxAccount> = {}): OfxAccount => ({
  bankId: "001",
  accountId: "12345-6",
  accountType: "CHECKING",
  balanceCents: 50_000,
  balanceMonth: 202_608,
  start: 202_608,
  end: 202_609,
  ...over,
});

const month = (value: number) => ({
  month: value,
  incomeCents: 1000,
  expenseCents: 400,
  balanceCents: 600,
  count: 1,
});

const report = (over: Partial<OfxReport> = {}): OfxReport => ({
  fileName: "extrato.ofx",
  fileHash: "a".repeat(64),
  org: "Banco",
  fid: "0001",
  currency: "BRL",
  accounts: [account()],
  months: [month(202_608), month(202_609)],
  totals: {
    incomeCents: 2000,
    expenseCents: 800,
    balanceCents: 1200,
    count: 2,
  },
  ...over,
});

export { account, report };
