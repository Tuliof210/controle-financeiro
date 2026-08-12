import { describe, expect, it } from "@jest/globals";
import { act, renderHook } from "@testing-library/react";
import { useForecastIntervals } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/intervals.hook.ts";
import { currentYyyymm } from "@/lib/months.ts";

describe("useForecastIntervals", () => {
  it("seeds a fresh form with the current month, both ends set", () => {
    const { result } = renderHook(() => useForecastIntervals(undefined));

    expect(result.current.intervals).toEqual([
      { key: 0, start: currentYyyymm(), end: currentYyyymm() },
    ]);
  });

  it("seeds an empty month list the same way", () => {
    const { result } = renderHook(() => useForecastIntervals([]));

    expect(result.current.intervals).toHaveLength(1);
  });

  it("rebuilds the intervals of the forecast being edited", () => {
    const { result } = renderHook(() =>
      useForecastIntervals([202_601, 202_602, 202_607]),
    );

    expect(result.current.intervals).toEqual([
      { key: 0, start: 202_601, end: 202_602 },
      { key: 1, start: 202_607, end: 202_607 },
    ]);
  });

  it("updates one row, leaving the others and their keys alone", () => {
    const { result } = renderHook(() =>
      useForecastIntervals([202_601, 202_607]),
    );

    act(() => {
      result.current.updateInterval(1, { start: 202_609, end: 202_610 });
    });

    expect(result.current.intervals).toEqual([
      { key: 0, start: 202_601, end: 202_601 },
      { key: 1, start: 202_609, end: 202_610 },
    ]);
  });

  it("adds a row on a fresh key", () => {
    const { result } = renderHook(() => useForecastIntervals(undefined));

    act(() => {
      result.current.addInterval();
    });

    expect(result.current.intervals.map((row) => row.key)).toEqual([0, 1]);
  });

  it("removes a row", () => {
    const { result } = renderHook(() =>
      useForecastIntervals([202_601, 202_607]),
    );

    act(() => {
      result.current.removeInterval(0);
    });

    expect(result.current.intervals).toEqual([
      { key: 1, start: 202_607, end: 202_607 },
    ]);
  });

  it("never removes the last row — a forecast needs a month", () => {
    const { result } = renderHook(() => useForecastIntervals(undefined));

    act(() => {
      result.current.removeInterval(0);
    });

    expect(result.current.intervals).toHaveLength(1);
  });
});
