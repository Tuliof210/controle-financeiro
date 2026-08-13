/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { ENTRY_TYPES, TYPE_LABELS } from "@/lib/entry-types.ts";

describe("ENTRY_TYPES", () => {
  it("is income then expense", () => {
    expect(ENTRY_TYPES).toEqual(["income", "expense"]);
  });
});

describe("TYPE_LABELS", () => {
  it("labels both types in pt-BR", () => {
    expect(TYPE_LABELS.income).toBe("Entrada");
    expect(TYPE_LABELS.expense).toBe("Saída");
  });

  it("covers every entry type", () => {
    for (const type of ENTRY_TYPES) {
      expect(TYPE_LABELS[type]).toBeTruthy();
    }
  });
});
