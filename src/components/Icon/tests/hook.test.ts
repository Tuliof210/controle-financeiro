import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useIcon } from "@/components/Icon/hook.ts";

describe("useIcon", () => {
  it("defaults to size 20 and stroke 1.75", () => {
    const { result } = renderHook(() => useIcon({ name: "plus" }));

    expect(result.current.svg).toMatchObject({
      width: 20,
      height: 20,
      strokeWidth: 1.75,
      viewBox: "0 0 24 24",
    });
  });

  it("hides from the tree unless titled", () => {
    const { result, rerender } = renderHook(
      (title?: string) => useIcon({ name: "wallet", title }),
      { initialProps: undefined as string | undefined },
    );

    expect(result.current.svg["aria-hidden"]).toBe(true);
    expect(result.current.svg.role).toBe("presentation");

    rerender("Carteira");

    expect(result.current.svg["aria-hidden"]).toBeUndefined();
    expect(result.current.svg.role).toBe("img");
    expect(result.current.title).toBe("Carteira");
  });
});
