import { describe, expect, it } from "vitest";
import { parsed, SGML_STATEMENT, statement, tx } from "./fixtures.helper";
import type { OfxStatement } from "./parse.helper";
import { parseOfx } from "./parse.helper";
import { buildReport } from "./report.helper";

const report = (...statements: OfxStatement[]) =>
  buildReport(parsed(...statements), "extrato.ofx");
const fixture = buildReport(parseOfx(SGML_STATEMENT), "extrato.ofx");

describe("buildReport — the monthly split", () => {
  it("sorts a transaction into entradas or saídas by the sign alone", () => {
    const [january] = report(
      statement([tx(202601, 300000), tx(202601, -45025)]),
    ).months;
    expect(january).toEqual({
      month: 202601,
      incomeCents: 300000,
      expenseCents: 45025,
      balanceCents: 254975,
      count: 2,
    });
  });

  it("counts a zero amount without moving either total", () => {
    const [jan] = report(statement([tx(202601, 0)])).months;
    expect(jan).toMatchObject({ count: 1, incomeCents: 0, expenseCents: 0 });
  });

  it("sums several accounts into one row, listing both", () => {
    const built = report(
      statement([tx(202601, 100000)], [null, null], "111"),
      statement([tx(202601, -25000)], [null, null], "222"),
    );
    expect(built.months).toHaveLength(1);
    expect(built.months[0]).toMatchObject({
      incomeCents: 100000,
      expenseCents: 25000,
      count: 2,
    });
    expect(built.accounts.map((a) => a.accountId)).toEqual(["111", "222"]);
  });
});

describe("buildReport — the months it renders", () => {
  it("zero-fills a month the statement covers but never posted to", () => {
    const built = report(
      statement([tx(202601, 1000), tx(202603, 2000)], [202601, 202603]),
    );
    expect(built.months.map((m) => m.month)).toEqual([202601, 202602, 202603]);
    expect(built.months[1]).toEqual({
      month: 202602,
      incomeCents: 0,
      expenseCents: 0,
      balanceCents: 0,
      count: 0,
    });
  });

  // The count also pins that `totals` sums the RENDERED rows rather than the
  // raw transactions — the two only agree while no row is dropped.
  it("keeps a transaction posted outside the declared window", () => {
    const built = report(statement([tx(202512, 1000)], [202601, 202602]));
    expect(built.months.map((m) => m.month)).toEqual([202512, 202601, 202602]);
    expect(built.totals.count).toBe(1);
  });

  it("renders nothing when there is neither a transaction nor a window", () => {
    expect(report(statement([])).months).toEqual([]);
  });

  // Guards buildMonths against a corrupt <DTEND>; the transactions survive it.
  it("ignores an absurd declared window rather than the real rows", () => {
    const built = report(statement([tx(202601, 1000)], [190001, 999912]));
    expect(built.months.map((m) => m.month)).toEqual([202601]);
  });
});

describe("buildReport — the payload", () => {
  it("totals the fixture's four transactions", () => {
    expect(fixture.totals).toEqual({
      incomeCents: 315000,
      expenseCents: 165025,
      balanceCents: 149975,
      count: 4,
    });
  });

  it("carries the institution, the currency and every account", () => {
    expect(fixture.org).toBe("Banco Teste");
    expect(fixture.currency).toBe("BRL");
    expect(fixture.accounts[0].balanceCents).toBe(149975);
  });

  it("bounds the file name it echoes back", () => {
    const name = `${"a".repeat(300)}.ofx`;
    expect(buildReport(parsed(), name).fileName).toHaveLength(120);
  });
});
