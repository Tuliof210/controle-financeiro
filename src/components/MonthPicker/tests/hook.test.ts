import { describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { useMonthPicker } from "@/components/MonthPicker/hook.ts";
import { currentYyyymm } from "@/lib/months.ts";

const base = { label: "Mês", id: "mes", onChange: jest.fn() };

const select = (value: string) =>
  ({ target: { value } }) as React.ChangeEvent<HTMLSelectElement>;

describe("useMonthPicker", () => {
  it("splits the value into the two selects", () => {
    const { result } = renderHook(() =>
      useMonthPicker({ ...base, value: 202_608 }),
    );

    expect(result.current).toMatchObject({ year: 2026, month: 8 });
  });

  it("offers twelve months and a hundred years", () => {
    const { result } = renderHook(() =>
      useMonthPicker({ ...base, value: 202_608 }),
    );

    expect(result.current.months).toHaveLength(12);
    expect(result.current.years).toHaveLength(100);
  });

  it("seeds an empty picker with the current month", () => {
    const onChange = jest.fn();
    renderHook(() => useMonthPicker({ ...base, value: null, onChange }));

    expect(onChange).toHaveBeenCalledWith(currentYyyymm());
  });

  it("recomposes when the month changes, keeping the year", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useMonthPicker({ ...base, value: 202_608, onChange }),
    );

    result.current.onMonthChange(select("12"));

    expect(onChange).toHaveBeenCalledWith(202_612);
  });

  it("recomposes when the year changes, keeping the month", () => {
    const onChange = jest.fn();
    const { result } = renderHook(() =>
      useMonthPicker({ ...base, value: 202_608, onChange }),
    );

    result.current.onYearChange(select("2030"));

    expect(onChange).toHaveBeenCalledWith(203_008);
  });
});
