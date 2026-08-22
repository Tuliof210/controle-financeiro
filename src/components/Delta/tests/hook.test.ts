import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useDelta } from "@/components/Delta/hook.ts";

describe("useDelta", () => {
  it("treats a rise as good by default", () => {
    const { result } = renderHook(() => useDelta({ value: 12 }));

    expect(result.current.deltaProps.className).toContain("positive");
    expect(result.current.arrow).toBe("trendingUp");
    expect(result.current.label).toBe("+12%");
  });

  it("treats a drop as good when inverted", () => {
    const { result } = renderHook(() =>
      useDelta({ value: -8, invert: true }),
    );

    expect(result.current.deltaProps.className).toContain("positive");
    expect(result.current.arrow).toBe("trendingDown");
    expect(result.current.label).toBe("−8%");
  });

  it("mutes a value inside the threshold", () => {
    const { result } = renderHook(() =>
      useDelta({ value: 0.4, neutralThreshold: 1 }),
    );

    expect(result.current.deltaProps.className).toContain("muted");
    expect(result.current.arrow).toBeUndefined();
  });

  it("defers formatting to MoneyDisplay when money", () => {
    const { result } = renderHook(() =>
      useDelta({ value: 400, money: true }),
    );

    expect(result.current.money).toBe(true);
    expect(result.current.label).toBeUndefined();
    expect(result.current.value).toBe(400);
  });
});
