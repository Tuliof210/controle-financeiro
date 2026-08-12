/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { projectGoals } from "@/app/api/dashboard/goals.helper.ts";
import type { Goal } from "@/core/entities/goal.entity.ts";

const goal = (id: string, name: string, targetCents: number) =>
  ({ id, name, targetCents }) as Goal;

const horizon = { pace: 1000, current: 202_601 };

describe("projectGoals", () => {
  it("queues the cheapest goal first", () => {
    const projected = projectGoals(
      [goal("g1", "Carro", 5000), goal("g2", "Livro", 1000)],
      horizon,
    );

    expect(projected.map((entry) => entry.id)).toEqual(["g2", "g1"]);
  });

  it("completes a one-month goal in the current month", () => {
    const [entry] = projectGoals([goal("g1", "Livro", 800)], horizon);

    expect(entry.dedicated).toEqual({ months: 1, doneMonth: 202_601 });
  });

  it("rounds a wait up to the next whole month", () => {
    const [entry] = projectGoals([goal("g1", "Carro", 2100)], horizon);

    expect(entry.dedicated).toEqual({ months: 3, doneMonth: 202_603 });
  });

  it("splits the capacity evenly for the parallel metric", () => {
    const projected = projectGoals(
      [goal("g1", "A", 1000), goal("g2", "B", 1000)],
      horizon,
    );

    expect(projected[0].parallel).toEqual({ months: 2, doneMonth: 202_602 });
  });

  it("waits on every cheaper goal for the serialized metric", () => {
    const projected = projectGoals(
      [goal("g1", "A", 1000), goal("g2", "B", 2000)],
      horizon,
    );

    expect(projected[1].serialized).toEqual({ months: 3, doneMonth: 202_603 });
  });

  it("reports every metric as null when nothing can be put aside", () => {
    const [entry] = projectGoals([goal("g1", "A", 1000)], {
      pace: 0,
      current: 202_601,
    });

    expect(entry).toMatchObject({
      dedicated: null,
      parallel: null,
      serialized: null,
    });
  });

  it("carries id, name and target through", () => {
    const [entry] = projectGoals([goal("g1", "Casa", 9000)], horizon);

    expect(entry).toMatchObject({ id: "g1", name: "Casa", targetCents: 9000 });
  });
});
