import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useIconButton } from "@/components/IconButton/hook.ts";

const base = { "aria-label": "Remover", children: null };

describe("useIconButton", () => {
  it("defaults to a ghost button of type button", () => {
    const { result } = renderHook(() => useIconButton(base));

    expect(result.current.type).toBe("button");
    expect(result.current.className).toContain("ghost");
  });

  it("uses the variant it is given", () => {
    const { result } = renderHook(() =>
      useIconButton({ ...base, variant: "destructive" }),
    );

    expect(result.current.className).toContain("destructive");
  });

  it("keeps the accessible name an icon-only button depends on", () => {
    const { result } = renderHook(() => useIconButton(base));

    expect(result.current["aria-label"]).toBe("Remover");
  });
});
