import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { buildFrame } from "@/app/_components/DashboardScreen/chart-frame.helper.ts";
import { useChartFrame } from "@/app/_components/DashboardScreen/components/ChartFrame/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const points = [
  { month: 202_608, income: 1000, expense: 400, cumulative: 600 },
] as MonthPoint[];

const frame = buildFrame(points, [600], 884, 240);

const mount = (width: number) =>
  renderHook(() =>
    useChartFrame({
      title: "Saldo",
      width,
      height: 240,
      frame,
      children: null,
    }),
  ).result.current;

describe("useChartFrame", () => {
  it("passes the plot and its title through", () => {
    expect(mount(884)).toMatchObject({ title: "Saldo", width: 884, frame });
  });

  it("labels the y axis in the format the gutter was sized for", () => {
    expect(mount(884).formatTick(12_345_600)).toBe("R$ 123.456");
    expect(mount(291).formatTick(12_345_600)).toBe("R$ 123,4K");
  });

  it("labels the x axis by month", () => {
    expect(mount(884).formatMonthTick(202_608)).toBe("Ago/26");
  });
});
