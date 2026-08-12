import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useIntervalList } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/hook.ts";

const handlers = {
  onUpdate: jest.fn(),
  onAdd: jest.fn(),
  onRemove: jest.fn(),
};

const row = (key: number) => ({ key, start: 202_601, end: 202_601 });

describe("useIntervalList", () => {
  it("keeps the last row when it is the only one", () => {
    const { result } = renderHook(() =>
      useIntervalList({ intervals: [row(0)], ...handlers }),
    );

    expect(result.current.canRemove).toBe(false);
  });

  it("allows removal once there is more than one", () => {
    const { result } = renderHook(() =>
      useIntervalList({ intervals: [row(0), row(1)], ...handlers }),
    );

    expect(result.current.canRemove).toBe(true);
    expect(result.current.intervals).toHaveLength(2);
  });

  it("passes the handlers through untouched", () => {
    const { result } = renderHook(() =>
      useIntervalList({ intervals: [row(0)], ...handlers }),
    );

    expect(result.current).toMatchObject(handlers);
  });
});
