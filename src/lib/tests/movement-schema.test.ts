/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { movementRowSchema } from "@/lib/movement-schema.ts";

const valid = {
  name: "Mercado",
  valueCents: 1234,
  type: "expense",
  month: 202_608,
};

describe("movementRowSchema", () => {
  it("accepts a well-formed row and trims the name", () => {
    const parsed = movementRowSchema.parse({ ...valid, name: "  Mercado  " });

    expect(parsed).toEqual(valid);
  });

  it("rejects an empty or over-long name", () => {
    expect(movementRowSchema.safeParse({ ...valid, name: "   " }).success).toBe(
      false,
    );
    expect(
      movementRowSchema.safeParse({ ...valid, name: "a".repeat(81) }).success,
    ).toBe(false);
  });

  it("rejects a non-positive or fractional value", () => {
    expect(
      movementRowSchema.safeParse({ ...valid, valueCents: 0 }).success,
    ).toBe(false);
    expect(
      movementRowSchema.safeParse({ ...valid, valueCents: 1.5 }).success,
    ).toBe(false);
  });

  it("rejects a type outside the entry tuple", () => {
    expect(
      movementRowSchema.safeParse({ ...valid, type: "transfer" }).success,
    ).toBe(false);
  });

  it("bounds the month to the picker's 2000-2099 domain", () => {
    expect(
      movementRowSchema.safeParse({ ...valid, month: 199_912 }).success,
    ).toBe(false);
    expect(
      movementRowSchema.safeParse({ ...valid, month: 210_001 }).success,
    ).toBe(false);
    expect(
      movementRowSchema.safeParse({ ...valid, month: 200_001 }).success,
    ).toBe(true);
    expect(
      movementRowSchema.safeParse({ ...valid, month: 209_912 }).success,
    ).toBe(true);
  });

  it("ignores ownerId, which each caller carries itself", () => {
    expect(movementRowSchema.parse({ ...valid, ownerId: "p1" })).toEqual(valid);
  });
});
