/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import type { Person } from "@/core/entities/person.entity.ts";
import {
  FAMILY_PROFILE,
  resolveOwnerId,
  splitByType,
  visibleFor,
} from "@/lib/ownership.ts";

const ana = { id: "p1", name: "Ana", color: "violet" } as Person;
const bia = { id: "p2", name: "Bia", color: "lime" } as Person;

const entries = [
  { ownerId: "p1", type: "income" as const },
  { ownerId: "p2", type: "expense" as const },
  { ownerId: "p1", type: "expense" as const },
];

describe("visibleFor", () => {
  it("shows every owner under the family sentinel", () => {
    expect(visibleFor(entries, FAMILY_PROFILE)).toHaveLength(3);
  });

  it("shows only the active person's entries", () => {
    expect(visibleFor(entries, "p1")).toEqual([entries[0], entries[2]]);
  });

  it("shows nothing for an unknown profile", () => {
    expect(visibleFor(entries, "ghost")).toEqual([]);
  });
});

describe("splitByType", () => {
  it("partitions into income and expense", () => {
    expect(splitByType(entries)).toEqual({
      income: [entries[0]],
      expense: [entries[1], entries[2]],
    });
  });

  it("gives both sides empty for no entries", () => {
    expect(splitByType([])).toEqual({ income: [], expense: [] });
  });
});

describe("resolveOwnerId", () => {
  it("keeps the active profile when it is a real person", () => {
    expect(resolveOwnerId("p2", [ana, bia])).toBe("p2");
  });

  it("falls back to the first person under the family sentinel", () => {
    expect(resolveOwnerId(FAMILY_PROFILE, [ana, bia])).toBe("p1");
  });

  it("yields an empty id when there is nobody", () => {
    expect(resolveOwnerId(FAMILY_PROFILE, [])).toBe("");
  });
});
