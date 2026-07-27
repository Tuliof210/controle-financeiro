import { describe, expect, it } from "vitest";
import { useRangeTimeline } from "./hook";

// Jan/26 -> Dez/27 unless stated: the 24-month window the browser check uses.
const timeline = (current: number, start = 202601, end = 202712) =>
  useRangeTimeline({ start, end, current });

const solidTicks = (view: ReturnType<typeof useRangeTimeline>) =>
  view.ticks.filter((tick) => tick.done).length;

describe("useRangeTimeline", () => {
  it("draws one tick per month and splits at the current month", () => {
    const view = timeline(202612);

    expect(view.ticks).toHaveLength(24);
    expect(solidTicks(view)).toBe(12);
    expect(view.caption).toBe("24 meses · 12 realizados · 12 projetados");
    expect(view.srLabel).toBe(
      "Período de Jan/26 a Dez/27: 12 de 24 meses realizados",
    );
  });

  // The current month is elapsed, not projected — the boundary is `<=`.
  it("counts the current month itself when it is the range's start", () => {
    const view = timeline(202601);

    expect(view.ticks[0]).toEqual({ month: 202601, done: true });
    expect(view.ticks[1]).toEqual({ month: 202602, done: false });
    expect(solidTicks(view)).toBe(1);
    expect(view.caption).toBe("24 meses · 1 realizados · 23 projetados");
  });

  it("counts every month when the current month is the range's end", () => {
    const view = timeline(202712);

    expect(solidTicks(view)).toBe(24);
    expect(view.caption).toBe("24 meses · 24 realizados · 0 projetados");
  });

  it("projects the whole range when the current month is before it", () => {
    const view = timeline(202512);

    expect(solidTicks(view)).toBe(0);
    expect(view.caption).toBe("24 meses · 0 realizados · 24 projetados");
  });

  it("realises the whole range when the current month is after it", () => {
    const view = timeline(202806);

    expect(solidTicks(view)).toBe(24);
    expect(view.caption).toBe("24 meses · 24 realizados · 0 projetados");
  });

  it("says mês, singular, for a one-month range", () => {
    const view = timeline(202603, 202603, 202603);

    expect(view.ticks).toEqual([{ month: 202603, done: true }]);
    expect(view.caption).toBe("1 mês · 1 realizados · 0 projetados");
  });

  // Reachable: PUT /api/settings only refines rangeEnd >= rangeStart when both
  // land in the same patch, so a two-step edit can invert the saved range.
  it("has nothing to draw for an inverted range", () => {
    expect(timeline(202612, 202712, 202601).ticks).toEqual([]);
  });
});
