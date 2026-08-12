import { describe, expect, it } from "@jest/globals";
import {
  isEntryValid,
  toEntryBase,
} from "@/components/EntryForm/entry-form.helper.ts";

const valid = { name: "Aluguel", valueCents: 1, ownerId: "p1" };

describe("isEntryValid", () => {
  it("accepts a named, priced, owned entry", () => {
    expect(isEntryValid(valid)).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(isEntryValid({ ...valid, name: "   " })).toBe(false);
  });

  it("rejects a value under one cent", () => {
    expect(isEntryValid({ ...valid, valueCents: 0 })).toBe(false);
  });

  it("rejects an entry with no owner", () => {
    expect(isEntryValid({ ...valid, ownerId: "" })).toBe(false);
  });
});

describe("toEntryBase", () => {
  it("trims the name and carries the rest through", () => {
    expect(
      toEntryBase({
        name: "  Aluguel  ",
        valueCents: 150_000,
        type: "expense",
        ownerId: "p1",
      }),
    ).toEqual({
      name: "Aluguel",
      valueCents: 150_000,
      type: "expense",
      ownerId: "p1",
    });
  });
});
