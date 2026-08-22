import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMoneyDisplay } from "@/components/MoneyDisplay/hook.ts";

describe("useMoneyDisplay", () => {
  it("defaults to base, no sign colour, dimming off", () => {
    const { result } = renderHook(() => useMoneyDisplay({ value: 123_456 }));

    expect(result.current.moneyProps.className).toContain("base");
    expect(result.current.moneyProps.className).not.toContain("positive");
    expect(result.current.moneyProps.className).not.toContain("negative");
    expect(result.current.dim).toBe(false);
    expect(result.current.head).toBe("R$ 1.234,");
    expect(result.current.fraction).toBe("56");
  });

  it("dims hero and large unless told otherwise", () => {
    const hero = renderHook(() =>
      useMoneyDisplay({ value: 100, variant: "hero" }),
    );

    expect(hero.result.current.dim).toBe(true);
    expect(hero.result.current.moneyProps.className).toContain("hero");
  });

  it("keeps the Unicode minus on the head", () => {
    const { result } = renderHook(() => useMoneyDisplay({ value: -64_000 }));

    expect(result.current.head).toBe("−R$ 640,");
    expect(result.current.moneyProps["aria-label"]).toBe("−R$ 640,00");
  });

  it("colours by sign only when asked", () => {
    const { result } = renderHook(() =>
      useMoneyDisplay({ value: -1, colorBySign: true }),
    );

    expect(result.current.moneyProps.className).toContain("negative");
  });
});
