import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { OfxReport } from "@/app/api/ofx/types.ts";
import { useReportView } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/hook.ts";
import { account, report } from "./report-fixture.ts";

const view = (over: Partial<OfxReport> = {}) =>
  renderHook(() =>
    useReportView({
      report: report(over),
      error: null,
      loading: false,
      onClose: jest.fn(),
      onFile: jest.fn(),
    }),
  ).result.current;

describe("useReportView", () => {
  it("suffixes the institution with its id", () => {
    expect(view().org).toBe("Banco · 0001");
  });

  it("falls back when the file named no institution", () => {
    expect(view({ org: null, fid: "0001" }).org).toBe("—");
  });

  it("falls back when the file named no currency", () => {
    expect(view({ currency: null }).currency).toBe("—");
  });

  it("agrees the badge phrase with the count", () => {
    expect(view().count).toBe("2 lançamentos lidos");
    expect(view({ totals: { ...report().totals, count: 1 } }).count).toBe(
      "1 lançamento lido",
    );
  });

  it("spans the period from the first month to the last", () => {
    expect(view().period).toBe("Ago/26 – Set/26");
  });

  it("falls back when the statement spans no dated month", () => {
    expect(view({ months: [] }).period).toBe("—");
  });

  it("keys the account lines by index, a file may repeat an account", () => {
    const keys = view({ accounts: [account(), account()] }).accounts.map(
      (item) => item.key,
    );

    expect(new Set(keys).size).toBe(2);
  });

  it("formats the totals and flags a negative balance", () => {
    expect(view().totals).toEqual({
      income: "R$ 20,00",
      expense: "R$ 8,00",
      balance: "R$ 12,00",
      count: 2,
      negative: false,
    });
    expect(
      view({ totals: { ...report().totals, balanceCents: -1 } }).totals
        .negative,
    ).toBe(true);
  });

  it("passes the whole report on to the import action", () => {
    expect(view().report.fileHash).toBe("a".repeat(64));
    expect(view().fileName).toBe("extrato.ofx");
  });
});
