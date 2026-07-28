import { describe, expect, it } from "vitest";
import { currentYYYYMM } from "@/lib/months";
import { renderHook } from "@/lib/render-hook.helper";
import { useRecurrenceIntervals } from "./intervals.hook";

// defaultInterval() is exercised through the hook that assembles it rather
// than exported and tested in isolation — .squad/learnings.md: test the hook
// that assembles a feature, not just the pure helper it calls.

describe("useRecurrenceIntervals", () => {
  it("seeds a single current-month interval when there are no initial months", () => {
    const { intervals } = renderHook(() => useRecurrenceIntervals(undefined));
    expect(intervals).toHaveLength(1);
    expect(intervals[0]).toMatchObject({
      start: currentYYYYMM(),
      end: currentYYYYMM(),
    });
  });

  it("builds intervals from initial months when given", () => {
    const { intervals } = renderHook(() =>
      useRecurrenceIntervals([202601, 202602, 202607]),
    );
    expect(intervals).toMatchObject([
      { start: 202601, end: 202602 },
      { start: 202607, end: 202607 },
    ]);
  });

  it("adds a new interval defaulting to the current month", () => {
    let added = false;
    const { intervals } = renderHook(() => {
      const view = useRecurrenceIntervals([202601]);
      if (!added) {
        added = true;
        view.addInterval();
      }
      return view;
    });
    expect(intervals).toHaveLength(2);
    expect(intervals[0]).toMatchObject({ start: 202601, end: 202601 });
    expect(intervals[1]).toMatchObject({
      start: currentYYYYMM(),
      end: currentYYYYMM(),
    });
  });

  it("updates the interval at the given index", () => {
    let updated = false;
    const { intervals } = renderHook(() => {
      const view = useRecurrenceIntervals([202601, 202607]);
      if (!updated) {
        updated = true;
        view.updateInterval(1, { start: 202608, end: 202609 });
      }
      return view;
    });
    expect(intervals[0]).toMatchObject({ start: 202601, end: 202601 });
    expect(intervals[1]).toMatchObject({ start: 202608, end: 202609 });
  });

  it("removes an interval when more than one remains", () => {
    let removed = false;
    const { intervals } = renderHook(() => {
      const view = useRecurrenceIntervals([202601, 202607]);
      if (!removed) {
        removed = true;
        view.removeInterval(0);
      }
      return view;
    });
    expect(intervals).toHaveLength(1);
    expect(intervals[0]).toMatchObject({ start: 202607, end: 202607 });
  });

  it("refuses to remove the last remaining interval", () => {
    let removed = false;
    const { intervals } = renderHook(() => {
      const view = useRecurrenceIntervals(undefined);
      if (!removed) {
        removed = true;
        view.removeInterval(0);
      }
      return view;
    });
    expect(intervals).toHaveLength(1);
  });
});
