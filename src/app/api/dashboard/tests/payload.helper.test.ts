/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { buildPayload } from "@/app/api/dashboard/payload.helper.ts";
import type { Forecast } from "@/core/entities/forecast.entity.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";
import type { Movement } from "@/core/entities/movement.entity.ts";

const months = [202_601, 202_602];
const range = { start: 202_601, end: 202_602, current: 202_601 };

const input = {
  range,
  months,
  currentIndex: 0,
  goals: [] as Goal[],
  movements: [{ month: 202_601, type: "income", valueCents: 2000 } as Movement],
  forecasts: [
    { months: [202_602], type: "expense", valueCents: 500 } as Forecast,
  ],
  cap: 50,
  limit: null,
  meta: null,
};

describe("buildPayload", () => {
  it("assembles an ok payload around the given range", () => {
    const payload = buildPayload(input);

    expect(payload).toMatchObject({ status: "ok", range, meta: null });
  });

  it("carries one point per month of the range", () => {
    const payload = buildPayload(input);

    expect(
      payload.status === "ok" && payload.points.map((p) => p.month),
    ).toEqual(months);
  });

  it("reports where the line starts being a projection", () => {
    const payload = buildPayload(input);

    expect(payload.status === "ok" && payload.dashedFrom).toBe(202_602);
  });

  it("derives the stats from the same points, per side", () => {
    const payload = buildPayload(input);

    expect(payload.status === "ok" && payload.income.total).toBe(2000);
    expect(payload.status === "ok" && payload.expense.total).toBe(500);
    expect(payload.status === "ok" && payload.balance.total).toBe(1500);
  });

  it("derives the pace from the ceiling it just built", () => {
    const payload = buildPayload(input);

    expect(payload.status === "ok" && payload.pace).toBeGreaterThan(0);
    expect(payload.status === "ok" && payload.ceiling.months).toHaveLength(2);
  });

  it("projects the goals against that pace", () => {
    const payload = buildPayload({
      ...input,
      goals: [{ id: "g1", name: "Casa", targetCents: 100 } as Goal],
    });

    expect(payload.status === "ok" && payload.goals[0]).toMatchObject({
      id: "g1",
      name: "Casa",
    });
  });

  it("echoes the Meta target it was handed", () => {
    expect(buildPayload({ ...input, meta: 700 })).toMatchObject({ meta: 700 });
  });
});
