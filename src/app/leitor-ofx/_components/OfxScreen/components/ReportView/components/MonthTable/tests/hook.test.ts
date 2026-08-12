import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMonthTable } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/hook.ts";

describe("useMonthTable", () => {
  it("hands the already-shaped rows and totals back", () => {
    const rows = [
      {
        month: 202_608,
        incomeCents: 1,
        expenseCents: 0,
        balanceCents: 1,
        count: 1,
      },
    ];
    const totals = {
      income: "R$ 0,01",
      expense: "R$ 0,00",
      balance: "R$ 0,01",
      count: 1,
      negative: false,
    };
    const { result } = renderHook(() => useMonthTable({ rows, totals }));

    expect(result.current).toEqual({ rows, totals });
  });
});
