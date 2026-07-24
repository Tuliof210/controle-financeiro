import { describe, expect, it } from "vitest";
import type { Person } from "@/core/entities/person.entity";
import type { EntryType } from "@/lib/entry-types";
import { resolveOwnerId, splitByType, visibleFor } from "./ownership";

// A minimal entry: the generics only constrain `ownerId` and `type`, so the
// suite stays independent of any one entity (recurrence, movement, ...).
type Entry = { id: string; ownerId: string; type: EntryType };
const entry = (overrides: Partial<Entry> & { id: string }): Entry => ({
  ownerId: "p1",
  type: "income",
  ...overrides,
});

const person = (id: string): Person => ({
  id,
  name: id,
  color: "violet",
  createdAt: new Date(),
});

describe("visibleFor", () => {
  it("returns everyone for familia", () => {
    const all = [
      entry({ id: "a", ownerId: "p1" }),
      entry({ id: "b", ownerId: "p2" }),
    ];
    expect(visibleFor(all, "familia")).toHaveLength(2);
  });

  it("filters down to the given owner", () => {
    const all = [
      entry({ id: "a", ownerId: "p1" }),
      entry({ id: "b", ownerId: "p2" }),
    ];
    expect(visibleFor(all, "p1")).toEqual([all[0]]);
  });
});

describe("splitByType", () => {
  it("splits entries into income and expense", () => {
    const income = entry({ id: "a", type: "income" });
    const expense = entry({ id: "b", type: "expense" });
    const result = splitByType([income, expense]);
    expect(result.income).toEqual([income]);
    expect(result.expense).toEqual([expense]);
  });
});

describe("resolveOwnerId", () => {
  it("keeps the active profile when it is a real person", () => {
    expect(resolveOwnerId("p2", [person("p1"), person("p2")])).toBe("p2");
  });

  it("falls back to the first person for the familia sentinel", () => {
    expect(resolveOwnerId("familia", [person("p1"), person("p2")])).toBe("p1");
  });

  it("falls back to the first person when the profile is stale", () => {
    expect(resolveOwnerId("gone", [person("p1")])).toBe("p1");
  });

  it("returns an empty string when there are no people", () => {
    expect(resolveOwnerId("familia", [])).toBe("");
  });
});
