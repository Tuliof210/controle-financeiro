/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { buildSeries } from "@/app/api/dashboard/series.helper.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

const MONTHS = [202_601];

const forecast = (over: Partial<Forecast> = {}): Forecast =>
  ({
    id: "f1",
    name: "f",
    valueCents: 1000,
    type: "expense",
    ownerId: "o",
    months: MONTHS,
    simulated: false,
    createdAt: new Date(0),
    ...over,
  }) as Forecast;

const movement = (over: Partial<Movement> = {}): Movement =>
  ({
    id: "m1",
    name: "m",
    valueCents: 1000,
    type: "expense",
    ownerId: "o",
    month: 202_601,
    createdAt: new Date(0),
    ...over,
  }) as Movement;

const flagOf = (movements: Movement[], forecasts: Forecast[]) =>
  buildSeries(MONTHS, movements, forecasts)[0].simulated;

// PRODUCT.md's invariant: projected, real and simulated must never read as the
// same kind of fact. The flag is what lets the chart say which of the three it is.
describe("buildSeries · simulated", () => {
  it("is false when nothing is simulated", () => {
    expect(flagOf([], [forecast()])).toBe(false);
  });

  it("is true when a simulated forecast is what the month shows", () => {
    expect(flagOf([], [forecast({ simulated: true })])).toBe(true);
  });

  // The precise part. A simulated forecast on a side the actuals already cover
  // moves no figure on screen, so calling that month simulated would be a lie.
  it("is false when the actuals already cover the simulated side", () => {
    expect(
      flagOf([movement({ valueCents: 5000 })], [forecast({ simulated: true })]),
    ).toBe(false);
  });

  it("tracks the two sides independently", () => {
    // Income simulated and winning, expense real and winning.
    const flag = flagOf(
      [movement({ type: "expense", valueCents: 9000 })],
      [
        forecast({ type: "income", valueCents: 7000, simulated: true }),
        forecast({ type: "expense", valueCents: 1000 }),
      ],
    );

    expect(flag).toBe(true);
  });

  // Deliberately NOT proportional: the flag asks whether a what-if is in the
  // figure at all, not whether it dominates it. One simulated cent on the winning
  // side still means the reader is looking at a number a what-if moved.
  it("is true even when the simulated share of the side is small", () => {
    expect(
      flagOf(
        [],
        [
          forecast({ id: "a", valueCents: 8000 }),
          forecast({ id: "b", valueCents: 100, simulated: true }),
        ],
      ),
    ).toBe(true);
  });
});
