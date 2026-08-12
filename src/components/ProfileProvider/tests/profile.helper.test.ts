import { describe, expect, it } from "@jest/globals";
import {
  isStaleProfile,
  resolveLabel,
} from "@/components/ProfileProvider/profile.helper.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import { FAMILY_PROFILE } from "@/lib/ownership.ts";

const people = [
  { id: "p1", name: "Ana" },
  { id: "p2", name: "Bia" },
] as Person[];

describe("resolveLabel", () => {
  it("names the family sentinel", () => {
    expect(resolveLabel(FAMILY_PROFILE, people)).toBe("Família");
  });

  it("names the active person", () => {
    expect(resolveLabel("p2", people)).toBe("Bia");
  });

  it("falls back to the family label for an id nobody holds", () => {
    expect(resolveLabel("ghost", people)).toBe("Família");
  });
});

describe("isStaleProfile", () => {
  it("never calls the family sentinel stale", () => {
    expect(isStaleProfile(FAMILY_PROFILE, [])).toBe(false);
  });

  it("is false while the person still exists", () => {
    expect(isStaleProfile("p1", people)).toBe(false);
  });

  it("is true once the person is gone", () => {
    expect(isStaleProfile("p1", [])).toBe(true);
  });
});
