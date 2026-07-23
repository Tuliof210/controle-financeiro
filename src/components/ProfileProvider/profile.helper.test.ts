import { describe, expect, it } from "vitest";
import type { Person } from "@/core/entities/person.entity";
import { isStaleProfile, resolveLabel } from "./profile.helper";

const people: Person[] = [
  { id: "1", name: "Ana", color: "azul", createdAt: new Date() },
];

describe("resolveLabel", () => {
  it("returns Família for the familia profile", () => {
    expect(resolveLabel("familia", people)).toBe("Família");
  });

  it("returns the matching person's name", () => {
    expect(resolveLabel("1", people)).toBe("Ana");
  });

  it("falls back to Família when the person id isn't found", () => {
    expect(resolveLabel("deleted-id", people)).toBe("Família");
  });
});

describe("isStaleProfile", () => {
  it("is never stale for the familia profile, even with no people", () => {
    expect(isStaleProfile("familia", [])).toBe(false);
  });

  it("is not stale when the profile matches a person", () => {
    expect(isStaleProfile("1", people)).toBe(false);
  });

  it("is stale when the profile matches no person", () => {
    expect(isStaleProfile("deleted-id", people)).toBe(true);
  });
});
