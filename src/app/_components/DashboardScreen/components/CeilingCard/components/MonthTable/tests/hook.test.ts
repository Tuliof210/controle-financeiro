import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMonthTable } from "@/app/_components/DashboardScreen/components/CeilingCard/components/MonthTable/hook.ts";

const row = {
  key: 202_608,
  label: "Ago/26",
  isCurrent: true,
  balance: "R$ 10,00",
  spend: "R$ 2,50",
  left: "R$ 7,50",
  share: 0.25,
};

describe("useMonthTable", () => {
  it("hands the share to CSS as a percentage custom property", () => {
    const { result } = renderHook(() =>
      useMonthTable({ id: "t", rows: [row] }),
    );

    expect(result.current.rows[0].style).toEqual({ "--share": "25%" });
  });

  it("carries every formatted figure through untouched", () => {
    const { result } = renderHook(() =>
      useMonthTable({ id: "t", rows: [row] }),
    );

    expect(result.current.rows[0]).toMatchObject(row);
  });
});
