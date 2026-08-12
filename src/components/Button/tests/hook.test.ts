import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useButton } from "@/components/Button/hook.ts";

describe("useButton", () => {
  it("defaults to a primary button of type button", () => {
    const { result } = renderHook(() => useButton({}));

    expect(result.current.type).toBe("button");
    expect(result.current.className).toContain("primary");
  });

  it("uses the variant it is given", () => {
    const { result } = renderHook(() => useButton({ variant: "danger" }));

    expect(result.current.className).toContain("danger");
  });

  it("appends the caller's className instead of replacing it", () => {
    const { result } = renderHook(() => useButton({ className: "wide" }));

    expect(result.current.className).toContain("wide");
    expect(result.current.className).toContain("primary");
  });

  it("passes the remaining button attributes through", () => {
    const { result } = renderHook(() =>
      useButton({ type: "submit", disabled: true }),
    );

    expect(result.current).toMatchObject({ type: "submit", disabled: true });
  });
});
