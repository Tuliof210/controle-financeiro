import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBrandMark } from "@/components/AppShell/components/BrandMark/hook.ts";

describe("useBrandMark", () => {
  it("names the mark after the product", () => {
    const { result } = renderHook(() => useBrandMark());

    expect(result.current).toEqual({ label: "Monevo" });
  });
});
