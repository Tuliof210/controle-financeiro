import { describe, expect, it } from "vitest";
import {
  CARD_ONLY,
  SGML_STATEMENT,
  TWO_ACCOUNTS,
  XML_STATEMENT,
} from "./fixtures.helper";
import { readOfx } from "./service";

const utf8 = (text: string) => new TextEncoder().encode(text);

// latin-1 has no multi-byte sequences: every code point below 256 is its own
// byte, which is exactly what makes an accent here invalid UTF-8 and trips the
// decoder's fallback.
const latin1 = (text: string) =>
  Uint8Array.from([...text].map((char) => char.charCodeAt(0)));

describe("readOfx — a statement it can read", () => {
  it("reports the months and totals of an SGML export", () => {
    const result = readOfx(utf8(SGML_STATEMENT), "extrato.ofx");
    expect(result.status).toBe("ok");
    if (result.status !== "ok") {
      return;
    }
    expect(result.report.months.map((m) => m.month)).toEqual([202601, 202602]);
    expect(result.report.totals.incomeCents).toBe(315000);
    expect(result.report.totals.expenseCents).toBe(165025);
    expect(result.report.fileName).toBe("extrato.ofx");
  });

  it("reads an XML export the same way", () => {
    const result = readOfx(utf8(XML_STATEMENT), "extrato.ofx");
    expect(result.status).toBe("ok");
  });

  it("sums a two-account file into one set of months", () => {
    const result = readOfx(utf8(TWO_ACCOUNTS), "extrato.ofx");
    expect(result.status).toBe("ok");
    if (result.status !== "ok") {
      return;
    }
    expect(result.report.accounts).toHaveLength(2);
    expect(result.report.totals).toEqual({
      incomeCents: 100000,
      expenseCents: 25000,
      balanceCents: 75000,
      count: 2,
    });
  });

  // The common case for Brazilian banks, and the one that decides whether the
  // header renders "Banco São João" or mojibake.
  it("decodes a latin-1 export end to end", () => {
    const result = readOfx(
      latin1(SGML_STATEMENT.replace("Banco Teste", "Banco São João")),
      "extrato.ofx",
    );
    expect(result.status).toBe("ok");
    if (result.status !== "ok") {
      return;
    }
    expect(result.report.org).toBe("Banco São João");
  });
});

describe("readOfx — what it refuses, and why", () => {
  it("refuses a file that is not OFX at all", () => {
    expect(readOfx(utf8("nome,valor\nMercado,10"), "x.csv").status).toBe(
      "not_ofx",
    );
  });

  it("names a credit-card export instead of reporting nothing", () => {
    expect(readOfx(utf8(CARD_ONLY), "fatura.ofx").status).toBe("card_only");
  });

  it("refuses an OFX with no checking-account statement", () => {
    const investments = "<OFX><INVSTMTMSGSRSV1></INVSTMTMSGSRSV1></OFX>";
    expect(readOfx(utf8(investments), "x.ofx").status).toBe("no_statement");
  });

  // A table of zeros answers nothing, so it is a refusal, not a report.
  it("refuses a statement whose transactions are all unusable", () => {
    const blank = `<OFX><STMTRS><BANKTRANLIST><DTSTART>20260101<DTEND>20260131
<STMTTRN><DTPOSTED>abc<TRNAMT>x</STMTTRN></BANKTRANLIST></STMTRS></OFX>`;
    expect(readOfx(utf8(blank), "x.ofx").status).toBe("empty");
  });

  it("refuses an empty file", () => {
    expect(readOfx(new Uint8Array([]), "x.ofx").status).toBe("not_ofx");
  });
});
