import { describe, expect, it } from "vitest";
import type { OfxReport } from "@/app/api/ofx/types";
import { parseSession } from "./session.helper";

const report: OfxReport = {
  fileName: "extrato.ofx",
  org: "Banco Teste",
  fid: "001",
  currency: "BRL",
  accounts: [],
  months: [
    {
      month: 202601,
      incomeCents: 1000,
      expenseCents: 0,
      balanceCents: 1000,
      count: 1,
    },
  ],
  totals: {
    incomeCents: 1000,
    expenseCents: 0,
    balanceCents: 1000,
    count: 1,
  },
};

describe("parseSession", () => {
  it("round-trips a stored report", () => {
    expect(parseSession(JSON.stringify(report))).toEqual(report);
  });

  it("reads an absent or empty entry as nothing", () => {
    expect(parseSession(null)).toBeNull();
    expect(parseSession("")).toBeNull();
  });

  it("survives content that is not JSON at all", () => {
    expect(parseSession("{")).toBeNull();
    expect(parseSession("hello")).toBeNull();
  });

  // The guard exists so the table never maps over undefined: a shape that
  // merely parses is not a report.
  it("rejects JSON whose report fields are missing or the wrong type", () => {
    expect(parseSession('{"foo":1}')).toBeNull();
    expect(parseSession('{"months":1,"accounts":[]}')).toBeNull();
    expect(parseSession('{"months":[],"accounts":"x"}')).toBeNull();
    expect(parseSession("null")).toBeNull();
    expect(parseSession("[]")).toBeNull();
  });
});
