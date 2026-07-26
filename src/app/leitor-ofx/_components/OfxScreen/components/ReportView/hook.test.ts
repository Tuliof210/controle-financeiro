import { describe, expect, it } from "vitest";
import type { OfxMonth, OfxReport } from "@/app/api/ofx/types";
import { useReportView } from "./hook";

const month = (m: number, income = 0, expense = 0): OfxMonth => ({
  month: m,
  incomeCents: income,
  expenseCents: expense,
  balanceCents: income - expense,
  count: income || expense ? 1 : 0,
});

const view = (over: Partial<OfxReport> = {}) =>
  useReportView({
    report: {
      fileName: "extrato.ofx",
      org: "Banco Teste",
      fid: "001",
      currency: "BRL",
      accounts: [],
      months: [month(202601, 300000), month(202602), month(202603, 0, 45025)],
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
      count: "2",
      fileName: "extrato.ofx",
    });
  });

  // Every OFX field the header shows is optional in the wild.
  it("falls back rather than rendering an empty header", () => {
    const bare = view({ org: null, fid: null, currency: null });
    expect(bare.org).toBe("—");
    expect(bare.currency).toBe("—");
  });

  it("has no period when the report renders no month at all", () => {
    expect(view({ months: [] }).period).toBe("—");
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
    const totals = {
      incomeCents: 0,
      expenseCents: 45025,
      balanceCents: -45025,
      count: 1,
    };
    expect(view({ totals }).totals).toMatchObject({
      balance: "−R$ 450,25",
      negative: true,
    });
  });

  // A file may legitimately hold the same account twice, so the key cannot be
  // built from the account's own fields alone.
  it("keys every account uniquely, even two identical ones", () => {
    const account = {
      bankId: "001",
      accountId: "1",
      accountType: null,
      balanceCents: null,
      balanceMonth: null,
      start: null,
      end: null,
    };
    const keys = view({ accounts: [account, account] }).accounts.map(
      (a) => a.key,
    );
    expect(new Set(keys).size).toBe(2);
  });
});
