/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import {
  applyEntryListQuery,
  DEFAULT_ENTRY_LIST_QUERY,
  type EntryListAdapters,
  type EntryListQuery,
} from "@/lib/entry-list-query.ts";

interface Row {
  name: string;
  kind: string;
  month: number;
  createdAt: string;
}

const adapters: EntryListAdapters<Row> = {
  getInitialDate: (entry) => entry.month,
  getCreatedAt: (entry) => entry.createdAt,
  getKind: (entry) => entry.kind,
};

const make = (
  name: string,
  kind: string,
  month: number,
  createdAt: string,
): Row => ({ name, kind, month, createdAt });

const salario = make("Salário", "fixed", 202_603, "2026-01-01T00:00:00.000Z");
const luz = make("Luz", "commitment", 202_601, "2026-02-01T00:00:00.000Z");
const aluguel = make("Aluguel", "fixed", 202_602, "2026-03-01T00:00:00.000Z");
const all = [salario, luz, aluguel];
const names = (rows: Row[]) => rows.map((entry) => entry.name);

const apply = (
  query: Partial<EntryListQuery>,
  extra: Partial<EntryListAdapters<Row>> = {},
) =>
  applyEntryListQuery(
    all,
    { ...DEFAULT_ENTRY_LIST_QUERY, ...query },
    { ...adapters, ...extra },
  );

describe("applyEntryListQuery name", () => {
  it("matches a trimmed, case- and accent-insensitive substring", () => {
    expect(names(apply({ name: "  SAL  " }))).toEqual(["Salário"]);
  });

  it("keeps every row when the name is blank", () => {
    expect(apply({ name: "   " })).toEqual(all);
  });
});

describe("applyEntryListQuery kind", () => {
  it("keeps rows whose kind equals the query", () => {
    expect(apply({ kind: "commitment" })).toEqual([luz]);
  });

  it("ignores the kind query when getKind is missing", () => {
    expect(apply({ kind: "commitment" }, { getKind: undefined })).toEqual(all);
  });
});

describe("applyEntryListQuery sort", () => {
  it("orders names A to Z, and Z to A when descending", () => {
    expect(names(apply({ sort: "name" }))).toEqual([
      "Aluguel",
      "Luz",
      "Salário",
    ]);
    expect(names(apply({ sort: "name", dir: "desc" }))).toEqual([
      "Salário",
      "Luz",
      "Aluguel",
    ]);
  });

  it("orders by the adapter's YYYYMM", () => {
    expect(apply({ sort: "initialDate" }).map((entry) => entry.month)).toEqual([
      202_601, 202_602, 202_603,
    ]);
    expect(
      apply({ sort: "initialDate", dir: "desc" }).map((entry) => entry.month),
    ).toEqual([202_603, 202_602, 202_601]);
  });

  it("orders by createdAt and leaves an already-ascending list alone", () => {
    expect(names(apply({}))).toEqual(["Salário", "Luz", "Aluguel"]);
    expect(names(apply({ dir: "desc" }))).toEqual([
      "Aluguel",
      "Luz",
      "Salário",
    ]);
  });
});
