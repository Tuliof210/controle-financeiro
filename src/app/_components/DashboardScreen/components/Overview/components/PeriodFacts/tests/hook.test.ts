import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { usePeriodFacts } from "@/app/_components/DashboardScreen/components/Overview/components/PeriodFacts/hook.ts";

describe("usePeriodFacts", () => {
  it("hands the already-built facts straight back", () => {
    const facts = [
      {
        key: "income",
        label: "Entradas · 3 meses",
        value: "R$ 1",
        sub: "média",
      },
    ];
    const { result } = renderHook(() => usePeriodFacts({ facts }));

    expect(result.current).toEqual({ facts });
  });
});
