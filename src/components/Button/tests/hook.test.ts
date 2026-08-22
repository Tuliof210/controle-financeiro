import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useButton } from "@/components/Button/hook.ts";

describe("useButton", () => {
  it("defaults to a primary md button of type button", () => {
    const { result } = renderHook(() => useButton({}));

    expect(result.current.buttonProps.type).toBe("button");
    expect(result.current.buttonProps.className).toContain("primary");
    expect(result.current.buttonProps.className).toContain("md");
  });

  it("uses the variant and size it is given", () => {
    const { result } = renderHook(() =>
      useButton({ variant: "secondary", size: "sm" }),
    );

    expect(result.current.buttonProps.className).toContain("secondary");
    expect(result.current.buttonProps.className).toContain("sm");
  });

  it("exposes a left icon for the renderer", () => {
    const { result } = renderHook(() =>
      useButton({ iconLeft: "plus", variant: "destructive" }),
    );

    expect(result.current.iconLeft).toBe("plus");
    expect(result.current.buttonProps.className).toContain("destructive");
  });

  it("hides icons while loading", () => {
    const { result } = renderHook(() =>
      useButton({ iconLeft: "plus", loading: true }),
    );

    expect(result.current.iconLeft).toBeUndefined();
    expect(result.current.buttonProps["aria-busy"]).toBe(true);
    expect(result.current.buttonProps.disabled).toBe(true);
  });

  it("is not busy unless it is loading", () => {
    const { result } = renderHook(() => useButton({}));

    expect(result.current.buttonProps["aria-busy"]).toBe(false);
    expect(result.current.buttonProps.disabled).toBe(false);
  });
});
