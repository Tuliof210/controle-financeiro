/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";
import { derivePeriod } from "@/core/use-cases/period.service.ts";

const movement = (month: number) => ({ month }) as Movement;
const forecast = (months: number[]) => ({ months }) as Forecast;

describe("derivePeriod", () => {
  it("returns null when there is nothing to project", () => {
    expect(derivePeriod([], [])).toBeNull();
  });

  it("spans oldest to newest across both sources", () => {
    expect(
      derivePeriod(
        [movement(202_605), movement(202_609)],
        [forecast([202_603, 202_612])],
      ),
    ).toEqual({ start: 202_603, end: 202_612 });
  });

  it("works from movements alone", () => {
    expect(derivePeriod([movement(202_607)], [])).toEqual({
      start: 202_607,
      end: 202_607,
    });
  });

  it("works from forecasts alone, flattening their active months", () => {
    expect(
      derivePeriod([], [forecast([202_701]), forecast([202_602])]),
    ).toEqual({ start: 202_602, end: 202_701 });
  });

  it("ignores a forecast with no active month", () => {
    expect(derivePeriod([movement(202_608)], [forecast([])])).toEqual({
      start: 202_608,
      end: 202_608,
    });
  });
});
