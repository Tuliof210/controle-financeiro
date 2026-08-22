import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useNavItem } from "@/components/AppShell/components/Aside/components/NavItem/hook.ts";

const props = {
  href: "/previsoes",
  label: "Previsões",
  active: false,
  collapsed: false,
  icon: "layoutDashboard" as const,
};

describe("useNavItem", () => {
  it("marks only the active link as the current page", () => {
    const { result } = renderHook(() => useNavItem(props));

    expect(result.current.currentPage).toBeUndefined();
  });

  it("marks the active link with page", () => {
    const { result } = renderHook(() => useNavItem({ ...props, active: true }));

    expect(result.current.currentPage).toBe("page");
  });

  it("adds the collapsed class only on the rail", () => {
    const { result, rerender } = renderHook(
      (next: boolean) => useNavItem({ ...props, collapsed: next }),
      { initialProps: false },
    );

    expect(result.current.className).not.toContain("collapsed");

    rerender(true);

    expect(result.current.className).toContain("collapsed");
  });

  it("passes href, label and icon through", () => {
    const { result } = renderHook(() => useNavItem(props));

    expect(result.current).toMatchObject({
      href: "/previsoes",
      label: "Previsões",
      icon: "layoutDashboard",
    });
  });
});
