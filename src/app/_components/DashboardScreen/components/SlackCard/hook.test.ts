import { describe, expect, it } from "vitest";
import type { SlackMonth } from "@/app/api/dashboard/types";
import { renderHook } from "@/lib/render-hook.helper";
import { useSlackCard } from "./hook";

const month = (m: number, total: number): SlackMonth => ({
  month: m,
  total,
  weekly: Math.floor(total / 4),
  daily: Math.floor(total / 30),
});

// useSlackCard now calls useShowAll, so it needs a render to run. The probe is
// one server pass — the toggle's expanded branch belongs to
// show-all.hook.test.ts, which covers it purely.
const card = (slack: SlackMonth[], current = 209912) =>
  renderHook(() => useSlackCard({ slack, current }));

const range = (count: number) =>
  Array.from({ length: count }, (_, i) => month(202601 + i, 1000 * (i + 1)));

describe("useSlackCard", () => {
  it("scales every bar against the roomiest month", () => {
    const { rows } = card([month(202607, 500), month(202608, 1000)]);
    expect(rows.map((r) => r.percent)).toEqual([50, 100]);
  });

  it("goes empty when no month leaves any room at all", () => {
    // An all-underwater range: every total 0, so a list of flat bars would say
    // nothing a sentence does not say better.
    expect(card([month(202607, 0)]).empty).toBe(true);
  });

  it("goes empty for an empty list without a NaN bar", () => {
    const { empty, rows } = card([]);
    expect(empty).toBe(true);
    expect(rows).toEqual([]);
  });

  it("is not empty as soon as one month has room", () => {
    expect(card([month(202607, 1)]).empty).toBe(false);
  });

  it("formats the three figures and names the row for screen readers", () => {
    const { rows } = card([month(202607, 3040000)]);
    expect(rows[0]).toMatchObject({
      label: "Jul/26",
      total: "R$ 30.400,00",
      weekly: "R$ 7.600,00",
      daily: "R$ 1.013,33",
      srLabel: "Jul/26: R$ 30.400,00 seguros para gastar",
    });
  });

  it("hatches only the months after the current one", () => {
    // The current month itself is history so far, not a projection.
    const { rows } = card(
      [month(202606, 100), month(202607, 100), month(202608, 100)],
      202607,
    );
    expect(rows.map((r) => r.projected)).toEqual([false, false, true]);
  });

  it("caps the list at eight rows and offers the rest behind the toggle", () => {
    const { rows, label, hidden } = card(range(12));
    expect(rows).toHaveLength(8);
    expect(label).toBe("Ver todos (12)");
    expect(hidden).toBe(true);
  });

  it("offers no toggle when the whole range already fits", () => {
    const { rows, hidden } = card(range(6));
    expect(rows).toHaveLength(6);
    expect(hidden).toBe(false);
  });
});
