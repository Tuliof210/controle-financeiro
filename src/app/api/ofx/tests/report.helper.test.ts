/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import type { OfxParse } from "@/app/api/ofx/parse.helper.ts";
import { buildReport } from "@/app/api/ofx/report.helper.ts";
import type { OfxAccount } from "@/app/api/ofx/types.ts";

const account = (start: number | null, end: number | null) =>
  ({ start, end }) as OfxAccount;

const parse = (transactions: { month: number; cents: number }[]): OfxParse => ({
  org: "Banco",
  fid: "1",
  cardBlocks: 0,
  statements: [
    { account: account(202_601, 202_603), currency: "BRL", transactions },
  ],
});

const report = buildReport(
  parse([
    { month: 202_601, cents: 1000 },
    { month: 202_601, cents: -400 },
    { month: 202_603, cents: 0 },
  ]),
  "extrato.ofx",
  "hash",
);

describe("buildReport", () => {
  it("carries the file identity and the institution through", () => {
    expect(report).toMatchObject({
      fileName: "extrato.ofx",
      fileHash: "hash",
      org: "Banco",
      fid: "1",
      currency: "BRL",
    });
  });

  it("truncates an over-long file name", () => {
    expect(buildReport(parse([]), "a".repeat(200), "h").fileName).toHaveLength(
      120,
    );
  });

  it("splits each month by the sign of the amount", () => {
    expect(report.months[0]).toEqual({
      month: 202_601,
      incomeCents: 1000,
      expenseCents: 400,
      balanceCents: 600,
      count: 2,
    });
  });

  it("counts a zero amount without moving either side", () => {
    expect(report.months[2]).toMatchObject({
      incomeCents: 0,
      expenseCents: 0,
      count: 1,
    });
  });

  it("zero-fills a month the statement covers but never posted to", () => {
    expect(report.months.map((month) => month.month)).toEqual([
      202_601, 202_602, 202_603,
    ]);
    expect(report.months[1]).toMatchObject({ count: 0, balanceCents: 0 });
  });

  it("sums the totals from the rendered months", () => {
    expect(report.totals).toEqual({
      incomeCents: 1000,
      expenseCents: 400,
      balanceCents: 600,
      count: 3,
    });
  });

  it("lists no month when nothing bounds the statement", () => {
    const bare: OfxParse = {
      org: null,
      fid: null,
      cardBlocks: 0,
      statements: [
        { account: account(null, null), currency: null, transactions: [] },
      ],
    };

    expect(buildReport(bare, "x.ofx", "h").months).toEqual([]);
  });
});
