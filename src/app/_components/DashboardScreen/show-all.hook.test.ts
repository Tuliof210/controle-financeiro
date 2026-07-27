import { describe, expect, it } from "vitest";
import { renderHook } from "@/lib/render-hook.helper";
import { showAllView, useShowAll } from "./show-all.hook";

const months = (count: number) =>
  Array.from({ length: count }, (_, index) => index + 1);

describe("showAllView", () => {
  it("shows only the first `cap` rows while collapsed", () => {
    expect(showAllView(months(12), false).rows).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8,
    ]);
  });

  it("shows every row once expanded", () => {
    expect(showAllView(months(12), true).rows).toHaveLength(12);
  });

  it("counts ALL rows in the label, not the visible ones", () => {
    // "Ver todos (8)" over a 12-month range would understate the list.
    expect(showAllView(months(12), false).label).toBe("Ver todos (12)");
    expect(showAllView(months(12), true).label).toBe("Mostrar menos");
  });

  it("offers no toggle when everything already fits", () => {
    // A six-month range: the button would say "Ver todos (6)" above six
    // visible rows.
    expect(showAllView(months(6), false).hidden).toBe(false);
    expect(showAllView(months(6), false).rows).toHaveLength(6);
  });

  it("puts the toggle boundary at strictly more than `cap`", () => {
    expect(showAllView(months(8), false).hidden).toBe(false);
    expect(showAllView(months(9), false).hidden).toBe(true);
  });

  it("degrades to an empty list rather than throwing", () => {
    expect(showAllView([], false)).toEqual({
      rows: [],
      label: "Ver todos (0)",
      hidden: false,
    });
  });
});

describe("useShowAll", () => {
  // Only the initial render is observable (see render-hook.helper.ts); the
  // expanded branch is covered by showAllView above. What this pins is the
  // wiring: that the hook starts collapsed and hands the view straight through.
  it("starts collapsed, with the toggle and the sliced rows", () => {
    const view = renderHook(() => useShowAll(months(12)));
    expect(view.rows).toHaveLength(8);
    expect(view.label).toBe("Ver todos (12)");
    expect(view.hidden).toBe(true);
    expect(typeof view.toggle).toBe("function");
  });

  it("honours a caller's own cap", () => {
    expect(renderHook(() => useShowAll(months(12), 3)).rows).toHaveLength(3);
  });
});
