import { describe, expect, it } from "vitest";
import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { derivePeriod } from "./period.service";

const movement = (month: number): Movement => ({
  id: "m1",
  name: "m",
  valueCents: 100,
  type: "income",
  ownerId: "p1",
  month,
  createdAt: new Date(0),
});

const recurrence = (months: number[]): Recurrence => ({
  id: "r1",
  name: "r",
  valueCents: 100,
  type: "income",
  ownerId: "p1",
  months,
  createdAt: new Date(0),
});

describe("derivePeriod", () => {
  it("returns null when both movements and recurrences are empty", () => {
    expect(derivePeriod([], [])).toBeNull();
  });

  it("spans a single movement's own month", () => {
    expect(derivePeriod([movement(202603)], [])).toEqual({
      start: 202603,
      end: 202603,
    });
  });

  it("spans a single recurrence's active months", () => {
    expect(derivePeriod([], [recurrence([202601, 202602, 202603])])).toEqual({
      start: 202601,
      end: 202603,
    });
  });

  it("takes the oldest -> newest across both sources combined", () => {
    expect(
      derivePeriod([movement(204012)], [recurrence([200501, 202601])]),
    ).toEqual({ start: 200501, end: 204012 });
  });
});
