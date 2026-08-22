import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useBadge } from "@/components/Badge/hook.ts";

describe("useBadge", () => {
  it("defaults to a soft neutral md pill", () => {
    const { result } = renderHook(() => useBadge({ children: "Fixa" }));

    expect(result.current.className).toContain("neutral");
    expect(result.current.className).toContain("soft");
    expect(result.current.className).toContain("md");
    expect(result.current.dot).toBe(false);
  });

  it("uses the tone, variant and size it is given", () => {
    const { result } = renderHook(() =>
      useBadge({
        tone: "positive",
        variant: "outline",
        size: "sm",
        children: "ok",
      }),
    );

    expect(result.current.className).toContain("positive");
    expect(result.current.className).toContain("outline");
    expect(result.current.className).toContain("sm");
    expect(result.current.iconSize).toBe(12);
  });

  it("exposes a leading icon for the renderer", () => {
    const { result } = renderHook(() =>
      useBadge({ icon: "check", children: "ok" }),
    );

    expect(result.current.icon).toBe("check");
  });
});
