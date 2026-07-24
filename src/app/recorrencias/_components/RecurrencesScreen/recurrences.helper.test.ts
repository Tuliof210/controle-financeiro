import { describe, expect, it } from "vitest";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { splitByType, visibleFor } from "./recurrences.helper";

const make = (overrides: Partial<Recurrence>): Recurrence => ({
  id: "1",
  name: "Test",
  valueCents: 1000,
  type: "income",
  ownerId: "p1",
  months: [202601, 202602, 202603],
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
  it("splits recurrences into income and expense", () => {
    const income = make({ id: "a", type: "income" });
    const expense = make({ id: "b", type: "expense" });
    const result = splitByType([income, expense]);
    expect(result.income).toEqual([income]);
    expect(result.expense).toEqual([expense]);
  });
});
