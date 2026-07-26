import { describe, expect, it } from "vitest";
import {
  CARD_ONLY,
  SGML_STATEMENT,
  TWO_ACCOUNTS,
  XML_STATEMENT,
} from "./fixtures.helper";
import { parseOfx } from "./parse.helper";

describe("parseOfx — the SGML dialect", () => {
  const parsed = parseOfx(SGML_STATEMENT);

  it("reads the institution past the pre-<OFX> header block", () => {
    expect(parsed.org).toBe("Banco Teste");
    expect(parsed.fid).toBe("001");
  });

  it("reads the account, its period and its ledger balance", () => {
    expect(parsed.statements[0].account).toEqual({
      bankId: "001",
      accountId: "12345-6",
      accountType: "CHECKING",
      balanceCents: 149975,
      balanceMonth: 202602,
      start: 202601,
      end: 202602,
    });
    expect(parsed.statements[0].currency).toBe("BRL");
  });

  it("reads every transaction with its month and signed amount", () => {
    expect(parsed.statements[0].transactions).toEqual([
      { month: 202601, cents: 300000 },
      { month: 202601, cents: -45025 },
      { month: 202602, cents: -120000 },
      { month: 202602, cents: 15000 },
    ]);
  });
});

// The two dialects differ only in whether leaf tags are closed, which is
// exactly what `leaf` is built to ignore — so the parse must be identical.
describe("parseOfx — the XML dialect", () => {
  it("produces the same account and transactions as the SGML fixture", () => {
    const xml = parseOfx(XML_STATEMENT);
    const sgml = parseOfx(SGML_STATEMENT);
    expect(xml.statements[0].account).toEqual(sgml.statements[0].account);
    expect(xml.statements[0].transactions).toEqual(
      sgml.statements[0].transactions,
    );
    expect(xml.org).toBe("Banco Teste");
  });
});

describe("parseOfx — what it refuses to read", () => {
  it("keeps several accounts apart instead of merging them", () => {
    const parsed = parseOfx(TWO_ACCOUNTS);
    expect(parsed.statements).toHaveLength(2);
    expect(parsed.statements.map((s) => s.account.accountId)).toEqual([
      "111",
      "222",
    ]);
    expect(parsed.statements[1].transactions).toEqual([
      { month: 202601, cents: -25000 },
    ]);
  });

  // <CCSTMTRS> shares a suffix with <STMTRS>, so the tag match has to be
  // anchored on the angle bracket or a card file would parse as a statement.
  it("counts credit-card blocks without reading them as statements", () => {
    const parsed = parseOfx(CARD_ONLY);
    expect(parsed.statements).toEqual([]);
    expect(parsed.cardBlocks).toBe(1);
  });

  it("returns nothing at all for a file that is not OFX", () => {
    const parsed = parseOfx("nome,valor\nMercado,10");
    expect(parsed).toEqual({
      org: null,
      fid: null,
      cardBlocks: 0,
      statements: [],
    });
  });

  it("drops a transaction whose date or amount is unusable", () => {
    const broken = `<OFX><STMTRS><BANKTRANLIST>
<STMTTRN><DTPOSTED>20260110<TRNAMT>10.00</STMTTRN>
<STMTTRN><DTPOSTED>abc<TRNAMT>10.00</STMTTRN>
<STMTTRN><DTPOSTED>20260110<TRNAMT>x</STMTTRN>
<STMTTRN><DTPOSTED>20260110</STMTTRN>
</BANKTRANLIST></STMTRS></OFX>`;
    expect(parseOfx(broken).statements[0].transactions).toEqual([
      { month: 202601, cents: 1000 },
    ]);
  });
});
