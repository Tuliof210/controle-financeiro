import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useTotalsRow } from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthTable/components/TotalsRow/hook.ts";

describe("useTotalsRow", () => {
  it("hands the already-formatted totals straight back", () => {
    const props = {
      income: "R$ 1.000,00",
      expense: "R$ 400,00",
      balance: "R$ 600,00",
      count: 12,
      negative: false,
    };
    const { result } = renderHook(() => useTotalsRow(props));

    expect(result.current).toBe(props);
  });
});
