/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { createSchema, updateSchema } from "@/app/api/people/schema.ts";

describe("createSchema", () => {
  it("trims the name", () => {
    expect(createSchema.parse({ name: "  Ana  ", color: "violet" })).toEqual({
      name: "Ana",
      color: "violet",
    });
  });

  it("rejects an empty or over-long name", () => {
    expect(createSchema.safeParse({ name: "", color: "violet" }).success).toBe(
      false,
    );
    expect(
      createSchema.safeParse({ name: "a".repeat(61), color: "violet" }).success,
    ).toBe(false);
  });

  it("rejects a colour outside the palette", () => {
    expect(
      createSchema.safeParse({ name: "Ana", color: "beige" }).success,
    ).toBe(false);
  });
});

describe("updateSchema", () => {
  it("requires a non-empty id on top of the create shape", () => {
    expect(
      updateSchema.safeParse({ id: "", name: "Ana", color: "violet" }).success,
    ).toBe(false);
    expect(
      updateSchema.parse({ id: "p1", name: "Ana", color: "violet" }),
    ).toMatchObject({ id: "p1" });
  });
});
