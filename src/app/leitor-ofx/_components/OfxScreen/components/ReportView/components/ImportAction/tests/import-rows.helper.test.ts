import { describe, expect, it } from "@jest/globals";
import {
  buildImportRows,
  IDENTIFIER_MAX,
} from "@/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/ImportAction/import-rows.helper.ts";

const month = (value: number, incomeCents: number, expenseCents: number) => ({
  month: value,
  incomeCents,
  expenseCents,
  balanceCents: incomeCents - expenseCents,
  count: 1,
});

describe("IDENTIFIER_MAX", () => {
  it("keeps the longest generated name under the schema's own cap", () => {
    expect(IDENTIFIER_MAX).toBe(40);
    expect(`Entrada ${"a".repeat(IDENTIFIER_MAX)} Ago/26`.length).toBeLessThan(
      80,
    );
  });
});

describe("buildImportRows", () => {
  it("names each row after its side, the identifier and the month", () => {
    expect(buildImportRows([month(202_608, 1000, 400)], "12345-6")).toEqual([
      {
        name: "Entrada 12345-6 Ago/26",
        valueCents: 1000,
        type: "income",
        month: 202_608,
      },
      {
        name: "Saída 12345-6 Ago/26",
        valueCents: 400,
        type: "expense",
        month: 202_608,
      },
    ]);
  });

  it("skips the side that posted nothing", () => {
    const rows = buildImportRows([month(202_608, 1000, 0)], "x");

    expect(rows).toHaveLength(1);
    expect(rows[0].type).toBe("income");
  });

  it("skips a zero-filled month entirely", () => {
    expect(buildImportRows([month(202_609, 0, 0)], "x")).toEqual([]);
  });

  it("trims the identifier so the name has no double space", () => {
    expect(buildImportRows([month(202_608, 1, 0)], "  x  ")[0].name).toBe(
      "Entrada x Ago/26",
    );
  });
});
