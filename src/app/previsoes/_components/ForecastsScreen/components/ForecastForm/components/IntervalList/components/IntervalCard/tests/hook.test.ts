import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useIntervalCard } from "@/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/hook.ts";

const mount = (start: number, end: number, onUpdate = jest.fn()) =>
  renderHook(() =>
    useIntervalCard({
      interval: { key: 3, start, end },
      index: 1,
      canRemove: true,
      onUpdate,
      onRemove: jest.fn(),
    }),
  );

describe("useIntervalCard", () => {
  it("reads a one-month interval as locked, naming that month alone", () => {
    const { result } = mount(202_605, 202_605);

    expect(result.current.isLocked).toBe(true);
    expect(result.current.rangeLabel).toBe("Mai/26");
    expect(result.current.durationLabel).toBe("1 mês");
  });

  it("reads a span as a range, with its length in months", () => {
    const { result } = mount(202_601, 202_603);

    expect(result.current.isLocked).toBe(false);
    expect(result.current.rangeLabel).toBe("Jan/26 → Mar/26");
    expect(result.current.durationLabel).toBe("3 meses");
  });

  it("shows a placeholder duration for an inverted range", () => {
    const { result } = mount(202_604, 202_601);

    expect(result.current.durationLabel).toBe("—");
  });

  it("names the remove action by the row's human position", () => {
    const { result } = mount(202_601, 202_601);

    expect(result.current.removeLabel).toBe("Remover intervalo 2");
    expect(result.current.idPrefix).toBe("forecast-interval-3");
  });

  it("moves one end at a time", () => {
    const onUpdate = jest.fn();
    const { result } = mount(202_601, 202_603, onUpdate);

    result.current.onStartChange(202_602);
    expect(onUpdate).toHaveBeenCalledWith(1, { start: 202_602, end: 202_603 });

    result.current.onEndChange(202_604);
    expect(onUpdate).toHaveBeenCalledWith(1, { start: 202_601, end: 202_604 });
  });

  it("moves both ends together while locked", () => {
    const onUpdate = jest.fn();
    const { result } = mount(202_605, 202_605, onUpdate);

    result.current.onMonthChange(202_607);

    expect(onUpdate).toHaveBeenCalledWith(1, { start: 202_607, end: 202_607 });
  });

  it("unlocking opens the range a month past its end", () => {
    const onUpdate = jest.fn();
    const { result } = mount(202_605, 202_605, onUpdate);

    result.current.onLockToggle();

    expect(onUpdate).toHaveBeenCalledWith(1, { start: 202_605, end: 202_606 });
  });

  it("locking collapses the range onto its start", () => {
    const onUpdate = jest.fn();
    const { result } = mount(202_601, 202_603, onUpdate);

    result.current.onLockToggle();

    expect(onUpdate).toHaveBeenCalledWith(1, { start: 202_601, end: 202_601 });
  });
});
