import { describe, expect, it } from "vitest";
import {
  type EntryFormBase,
  isEntryValid,
  toEntryBase,
} from "./entry-form.helper";

const valid: EntryFormBase = {
  name: "Salario",
  valueCents: 500000,
  type: "income",
  ownerId: "p1",
};

describe("isEntryValid", () => {
  it("accepts a fully filled entry", () => {
    expect(isEntryValid(valid)).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(isEntryValid({ ...valid, name: "" })).toBe(false);
  });

  it("rejects a whitespace-only name", () => {
    expect(isEntryValid({ ...valid, name: "   " })).toBe(false);
  });

  it("rejects a zero value", () => {
    expect(isEntryValid({ ...valid, valueCents: 0 })).toBe(false);
  });

  it("accepts the minimum value of one cent", () => {
    expect(isEntryValid({ ...valid, valueCents: 1 })).toBe(true);
  });

  it("rejects a missing owner", () => {
    expect(isEntryValid({ ...valid, ownerId: "" })).toBe(false);
  });
});

describe("toEntryBase", () => {
  it("trims the name", () => {
    expect(toEntryBase({ ...valid, name: "  Salario  " }).name).toBe("Salario");
  });

  it("passes the other fields through untouched", () => {
    expect(toEntryBase(valid)).toEqual(valid);
  });
});
