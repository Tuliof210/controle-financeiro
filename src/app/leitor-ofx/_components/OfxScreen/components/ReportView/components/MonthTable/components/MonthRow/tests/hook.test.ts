import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMonthRow } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/components/MonthRow/hook.ts";

const month = {
  month: 202_608,
  incomeCents: 100_000,
  expenseCents: 40_000,
  balanceCents: 60_000,
  count: 12,
};

describe("useMonthRow", () => {
  it("formats every figure and names the month", () => {
    const { result } = renderHook(() => useMonthRow({ month }));

    expect(result.current).toEqual({
      label: "Ago/26",
      income: "R$ 1.000,00",
      expense: "R$ 400,00",
      balance: "R$ 600,00",
      count: 12,
      negative: false,
    });
  });

  it("flags a negative balance, the sign still carrying the meaning", () => {
    const { result } = renderHook(() =>
      useMonthRow({ month: { ...month, balanceCents: -100 } }),
    );

    expect(result.current.negative).toBe(true);
    expect(result.current.balance).toBe("−R$ 1,00");
  });

  it("does not flag a zero balance", () => {
    const { result } = renderHook(() =>
      useMonthRow({ month: { ...month, balanceCents: 0 } }),
    );

    expect(result.current.negative).toBe(false);
  });
});
