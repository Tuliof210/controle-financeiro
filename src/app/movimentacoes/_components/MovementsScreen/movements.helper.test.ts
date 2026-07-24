import { describe, expect, it } from "vitest";
import type { Movement } from "@/core/entities/movement.entity";
import { splitByType, visibleFor } from "./movements.helper";

const make = (overrides: Partial<Movement>): Movement => ({
  id: "1",
  name: "Test",
  valueCents: 1000,
  type: "income",
  ownerId: "p1",
  month: 202601,
  createdAt: new Date(),
  ...overrides,
});

describe("visibleFor", () => {
  it("returns everyone for familia", () => {
    const all = [
      make({ id: "a", ownerId: "p1" }),
      make({ id: "b", ownerId: "p2" }),
    ];
    expect(visibleFor(all, "familia")).toHaveLength(2);
  });

  it("filters down to the given owner", () => {
    const all = [
      make({ id: "a", ownerId: "p1" }),
      make({ id: "b", ownerId: "p2" }),
    ];
    expect(visibleFor(all, "p1")).toEqual([all[0]]);
  });
});

describe("splitByType", () => {
  it("splits movements into income and expense", () => {
    const income = make({ id: "a", type: "income" });
    const expense = make({ id: "b", type: "expense" });
    const result = splitByType([income, expense]);
    expect(result.income).toEqual([income]);
    expect(result.expense).toEqual([expense]);
  });
});
