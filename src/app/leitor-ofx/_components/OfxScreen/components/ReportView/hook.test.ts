import { describe, expect, it } from "vitest";
import type { OfxAccount, OfxMonth, OfxReport } from "@/app/api/ofx/types";
import { useReportView } from "./hook";

// A month's own amounts feed no assertion — the report's declared totals do.
const zero = { incomeCents: 0, expenseCents: 0, balanceCents: 0, count: 0 };
const month = (m: number): OfxMonth => ({ month: m, ...zero });

const account = (balanceCents: number): OfxAccount => ({
  bankId: "001",
  accountId: "12345-6",
  accountType: "CHECKING",
  balanceCents,
  balanceMonth: 202602,
  start: null,
  end: null,
});

const view = (over: Partial<OfxReport> = {}) =>
  useReportView({
    report: {
      fileName: "extrato.ofx",
      org: "Banco Teste",
      fid: "001",
      currency: "BRL",
      accounts: [],
      months: [month(202601), month(202602), month(202603)],
      totals: {
        incomeCents: 300000,
        expenseCents: 45025,
        balanceCents: 254975,
        count: 2,
      },
      ...over,
    },
    error: null,
    loading: false,
    onClose: () => {},
    onFile: () => {},
  });

describe("useReportView — the header", () => {
  // The period spans the months the TABLE renders, not the declared window.
  it("spans the rendered months and joins the institution with its id", () => {
    expect(view()).toMatchObject({
      period: "Jan/26 – Mar/26",
      org: "Banco Teste · 001",
      currency: "BRL",
      count: "2 lançamentos lidos",
      fileName: "extrato.ofx",
    });
  });

  // 1 is a legitimate count, and the badge renders this string verbatim.
  it("agrees the badge's noun with the number in front of it", () => {
    const one = { ...zero, count: 1 };
    expect(view({ totals: one }).count).toBe("1 lançamento lido");
  });

  // A file carrying only <FID> must not print a bare "001" under "Instituição".
  it("falls back rather than rendering an empty header", () => {
    const bare = view({ org: null, fid: null, currency: null });
    expect(bare).toMatchObject({ org: "—", currency: "—" });
    expect(view({ org: null, fid: "001" }).org).toBe("—");
    expect(view({ fid: null }).org).toBe("Banco Teste");
    expect(view({ months: [] }).period).toBe("—");
    expect(view()).toMatchObject({ account: "—", finalBalance: "—" });
  });
});

describe("useReportView — the table", () => {
  it("formats the totals row and tints only a negative balance", () => {
    expect(view().totals).toMatchObject({
      income: "R$ 3.000,00",
      expense: "R$ 450,25",
      balance: "R$ 2.549,75",
      negative: false,
    });
  });

  it("marks a period that spent more than it took in", () => {
    const spent = { incomeCents: 0, expenseCents: 45025, count: 1 };
    const totals = { ...spent, balanceCents: -45025 };
    expect(view({ totals }).totals).toMatchObject({
      balance: "−R$ 450,25",
      negative: true,
    });
  });

  // A file may legitimately hold the same account twice, so the key cannot be
  // built from its fields alone. The metadata facts ride along from
  // account.helper.ts; their own cases live beside it.
  it("keys every account uniquely, and carries the account facts", () => {
    const seen = view({ accounts: [account(149975), account(5000)] });
    expect(new Set(seen.accounts.map((a) => a.key)).size).toBe(2);
    expect(seen.account).toBe("12345-6 +1");
    expect(seen.finalBalance).toBe("R$ 50,00");
  });
});
