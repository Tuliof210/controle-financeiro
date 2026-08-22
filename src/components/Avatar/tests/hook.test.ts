import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useAvatar } from "@/components/Avatar/hook.ts";

const CAT_PREFIX = /^var\(--cat-/;

describe("useAvatar", () => {
  it("defaults to the md circle and hashes color from the name", () => {
    const { result } = renderHook(() => useAvatar({ name: "Ana Silva" }));

    expect(result.current.style.width).toBe(36);
    expect(result.current.style.height).toBe(36);
    expect(result.current.style.background).toMatch(CAT_PREFIX);
    expect(result.current.initials).toBe("AS");
    expect(result.current.label).toBe("Ana Silva");
  });

  it("keeps an explicit palette color", () => {
    const { result } = renderHook(() =>
      useAvatar({ name: "Bia", color: "var(--cat-cyan)" }),
    );

    expect(result.current.style.background).toBe("var(--cat-cyan)");
  });
});
