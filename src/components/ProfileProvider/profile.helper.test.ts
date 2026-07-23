import { describe, expect, it } from "vitest";
import type { Person } from "@/core/entities/person.entity";
import { resolveLabel } from "./profile.helper";

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
