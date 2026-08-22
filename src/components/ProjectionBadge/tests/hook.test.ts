import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useProjectionBadge } from "@/components/ProjectionBadge/hook.ts";

describe("useProjectionBadge", () => {
  it("defaults to a real md badge with an icon", () => {
    const { result } = renderHook(() => useProjectionBadge({}));

    expect(result.current.className).toContain("real");
    expect(result.current.className).toContain("md");
    expect(result.current.icon).toBe("check");
    expect(result.current.label).toBe("Real");
  });

  it("labels simulado and dashes it, not just a hue", () => {
    const { result } = renderHook(() =>
      useProjectionBadge({ kind: "simulado" }),
    );

    expect(result.current.className).toContain("simulado");
    expect(result.current.icon).toBe("sparkles");
    expect(result.current.label).toBe("Simulado");
  });

  it("hides the icon when asked", () => {
    const { result } = renderHook(() =>
      useProjectionBadge({ showIcon: false }),
    );

    expect(result.current.icon).toBeUndefined();
  });
});
