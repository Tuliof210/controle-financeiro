/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { parseOfx } from "@/app/api/ofx/parse.helper.ts";

const sgml = `
<OFX><SIGNONMSGSRSV1><FI><ORG>Banco Teste
<FID>0001
</FI></SIGNONMSGSRSV1>
<STMTRS><CURDEF>BRL
<BANKID>001
<ACCTID>12345-6
<ACCTTYPE>CHECKING
<BANKTRANLIST><DTSTART>20260101<DTEND>20260228
<STMTTRN><DTPOSTED>20260115<TRNAMT>1234.56</STMTTRN>
<STMTTRN><DTPOSTED>20260210<TRNAMT>-40.00</STMTTRN>
<STMTTRN><DTPOSTED>bad<TRNAMT>10.00</STMTTRN>
<STMTTRN><DTPOSTED>20260210</STMTTRN>
</BANKTRANLIST>
<LEDGERBAL><BALAMT>500.00<DTASOF>20260228</LEDGERBAL>
</STMTRS></OFX>`;

describe("parseOfx", () => {
  const parse = parseOfx(sgml);

  it("reads the institution leaves", () => {
    expect(parse).toMatchObject({ org: "Banco Teste", fid: "0001" });
  });

  it("reads the account block", () => {
    expect(parse.statements[0].account).toEqual({
      bankId: "001",
      accountId: "12345-6",
      accountType: "CHECKING",
      balanceCents: 50_000,
      balanceMonth: 202_602,
      start: 202_601,
      end: 202_602,
    });
  });

  it("reads the currency", () => {
    expect(parse.statements[0].currency).toBe("BRL");
  });

  it("keeps only the rows with a usable date and amount", () => {
    expect(parse.statements[0].transactions).toEqual([
      { month: 202_601, cents: 123_456 },
      { month: 202_602, cents: -4000 },
    ]);
  });

  it("counts credit-card aggregates without reading them", () => {
    const parsed = parseOfx("<OFX><CCSTMTRS>x</CCSTMTRS></OFX>");

    expect(parsed.cardBlocks).toBe(1);
    expect(parsed.statements).toEqual([]);
  });

  it("yields nulls rather than throwing on a statement with nothing in it", () => {
    const parsed = parseOfx("<OFX><STMTRS></STMTRS></OFX>");

    expect(parsed.statements[0].account).toMatchObject({
      bankId: null,
      balanceCents: null,
      balanceMonth: null,
    });
    expect(parsed.statements[0].transactions).toEqual([]);
  });

  it("reads the XML dialect the same way", () => {
    const parsed = parseOfx(
      "<OFX><STMTRS><CURDEF>BRL</CURDEF><STMTTRN><DTPOSTED>20260115</DTPOSTED><TRNAMT>1.00</TRNAMT></STMTTRN></STMTRS></OFX>",
    );

    expect(parsed.statements[0].transactions).toEqual([
      { month: 202_601, cents: 100 },
    ]);
  });
});
