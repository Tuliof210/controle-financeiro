import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useCard } from "@/components/Card/hook.ts";

describe("useCard", () => {
  it("defaults to a flat md div", () => {
    const { result } = renderHook(() => useCard({ children: null }));

    expect(result.current.tag).toBe("div");
    expect(result.current.cardProps.className).toContain("flat");
    expect(result.current.cardProps.className).toContain("md");
  });

  it("uses the variant, padding and tag it is given", () => {
    const { result } = renderHook(() =>
      useCard({
        variant: "elevated",
        padding: "lg",
        as: "section",
        children: null,
      }),
    );

    expect(result.current.tag).toBe("section");
    expect(result.current.cardProps.className).toContain("elevated");
    expect(result.current.cardProps.className).toContain("lg");
  });

  it("marks an interactive card", () => {
    const { result } = renderHook(() =>
      useCard({ interactive: true, children: null }),
    );

    expect(result.current.cardProps.className).toContain("interactive");
  });
});
