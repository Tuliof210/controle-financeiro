/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { createSchema, updateSchema } from "@/app/api/forecasts/schema.ts";

const valid = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
  months: [202_608],
};

describe("createSchema", () => {
  it("dedupes and sorts the active months", () => {
    expect(
      createSchema.parse({ ...valid, months: [202_612, 202_601, 202_612] })
        .months,
    ).toEqual([202_601, 202_612]);
  });

  it("defaults a body that predates simulations to a real forecast", () => {
    expect(createSchema.parse(valid).simulated).toBe(false);
  });

  it("keeps an explicit simulated flag", () => {
    expect(createSchema.parse({ ...valid, simulated: true }).simulated).toBe(
      true,
    );
  });

  it("defaults a body that predates kinds to a fixed forecast", () => {
    expect(createSchema.parse(valid).kind).toBe("fixed");
  });

  it("keeps an explicit kind", () => {
    expect(createSchema.parse({ ...valid, kind: "commitment" }).kind).toBe(
      "commitment",
    );
  });

  it("rejects an unknown kind", () => {
    expect(createSchema.safeParse({ ...valid, kind: "maybe" }).success).toBe(
      false,
    );
  });

  it("requires at least one active month", () => {
    expect(createSchema.safeParse({ ...valid, months: [] }).success).toBe(
      false,
    );
  });

  it("bounds each month to the picker's domain", () => {
    expect(
      createSchema.safeParse({ ...valid, months: [199_912] }).success,
    ).toBe(false);
    expect(
      createSchema.safeParse({ ...valid, months: [210_001] }).success,
    ).toBe(false);
  });

  it("requires an owner and a positive value", () => {
    expect(createSchema.safeParse({ ...valid, ownerId: "" }).success).toBe(
      false,
    );
    expect(createSchema.safeParse({ ...valid, valueCents: 0 }).success).toBe(
      false,
    );
  });
});

describe("updateSchema", () => {
  it("requires a non-empty id on top of the create shape", () => {
    expect(updateSchema.safeParse({ ...valid, id: "" }).success).toBe(false);
    expect(updateSchema.parse({ ...valid, id: "f1" })).toMatchObject({
      id: "f1",
    });
  });
});
