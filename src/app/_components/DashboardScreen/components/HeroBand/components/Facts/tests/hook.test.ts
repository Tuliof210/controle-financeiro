import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useFacts } from "@/app/_components/DashboardScreen/components/HeroBand/components/Facts/hook.ts";

describe("useFacts", () => {
  it("hands the already-built facts straight back", () => {
    const facts = [
      { key: "income", label: "ENTRADAS 3M", value: "R$ 1", sub: "média" },
    ];
    const { result } = renderHook(() => useFacts({ facts }));

    expect(result.current).toEqual({ facts });
  });
});
