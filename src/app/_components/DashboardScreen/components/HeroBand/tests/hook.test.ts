import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import type { BoardData } from "@/app/_components/DashboardScreen/components/Board/hook.ts";
import { useHeroBand } from "@/app/_components/DashboardScreen/components/HeroBand/hook.ts";
import type { MonthPoint } from "@/app/api/dashboard/types.ts";

const point = (month: number, cumulative: number) =>
  ({ month, cumulative, income: 1000, expense: 400 }) as MonthPoint;

const data = (points: MonthPoint[], current = 202_601) =>
  ({
    points,
    range: { start: 202_601, end: 202_603, current },
  }) as BoardData;

const band = (payload?: BoardData, refreshing?: boolean) =>
  renderHook(() => useHeroBand({ data: payload, refreshing })).result.current;

describe("useHeroBand", () => {
  it("renders no figure while the payload has not landed", () => {
    expect(band().figures).toBeNull();
  });

  it("renders no figure for a payload with no month in it", () => {
    expect(band(data([])).figures).toBeNull();
  });

  it("reads the projection's end against the current month", () => {
    const { figures } = band(data([point(202_601, 100), point(202_603, 500)]));

    expect(figures).toMatchObject({
      endLabel: "Mar/26",
      value: 500,
      now: "R$ 1,00",
      delta: "R$ 4,00",
      deltaUp: true,
      deltaGlyph: "▲",
    });
  });

  it("points the glyph down when the projection loses ground", () => {
    const { figures } = band(data([point(202_601, 500), point(202_603, 100)]));

    expect(figures).toMatchObject({ deltaUp: false, deltaGlyph: "▼" });
  });

  it("falls back to the first point when the clock is outside the range", () => {
    const { figures } = band(
      data([point(202_601, 100), point(202_603, 500)], 209_912),
    );

    expect(figures?.now).toBe("R$ 1,00");
  });

  // The caret reads off `live`, so the two states it has to tell apart are a
  // band with no answer at all and a band whose answer is being replaced.
  it("is not live until a payload lands, and not while one is in flight", () => {
    const points = [point(202_601, 100), point(202_603, 500)];

    expect(band().live).toBe(false);
    expect(band(data(points), true).live).toBe(false);
    expect(band(data(points)).live).toBe(true);
  });

  it("carries the bottom strip's facts", () => {
    const { figures } = band(data([point(202_601, 100)]));

    expect(figures?.facts).toHaveLength(3);
  });
});
