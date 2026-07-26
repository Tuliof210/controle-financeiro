import type { OfxParse, OfxStatement, OfxTransaction } from "./parse.helper";

// OFX samples and parse factories shared by this folder's test suites. Not a
// *.test.ts file, so Vitest does not collect it, and no app code imports it.
//
// SYNTHETIC DATA ONLY — fixtures under src/ are committed (.gitignore covers
// only /src/generated/prisma). Never paste a real bank export in here.

// Only the transactions and the declared window feed any report rule; the rest
// of the account is carried through untouched.
export const statement = (
  transactions: OfxTransaction[],
  [start, end]: [number | null, number | null] = [null, null],
  accountId = "111",
): OfxStatement => ({
  account: {
    bankId: "001",
    accountId,
    accountType: "CHECKING",
    balanceCents: null,
    balanceMonth: null,
    start,
    end,
  },
  currency: "BRL",
  transactions,
});

export const tx = (month: number, cents: number): OfxTransaction => ({
  month,
  cents,
});

export const parsed = (...statements: OfxStatement[]): OfxParse => ({
  org: "Banco Teste",
  fid: "001",
  cardBlocks: 0,
  statements,
});

// OFX 1.x (SGML): leaf elements have no closing tag, aggregates do. Keep the
// pre-<OFX> header block — banks send it and the parser must tolerate it.
// Jan/26: +3000.00 / -450.25. Fev/26: -1200.00 / +150.00.
export const SGML_STATEMENT = `OFXHEADER:100
DATA:OFXSGML
VERSION:102
CHARSET:1252

<OFX><SIGNONMSGSRSV1><SONRS><STATUS><CODE>0</STATUS>
<FI><ORG>Banco Teste<FID>001</FI></SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>BRL
<BANKACCTFROM><BANKID>001<ACCTID>12345-6<ACCTTYPE>CHECKING</BANKACCTFROM>
<BANKTRANLIST><DTSTART>20260101<DTEND>20260228
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260105<TRNAMT>3000.00<FITID>1<MEMO>Salario</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260110<TRNAMT>-450.25<FITID>2<MEMO>Mercado</STMTTRN>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260212<TRNAMT>-1200.00<FITID>3<MEMO>Aluguel</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260220<TRNAMT>150.00<FITID>4<MEMO>Estorno</STMTTRN>
</BANKTRANLIST><LEDGERBAL><BALAMT>1499.75<DTASOF>20260228</LEDGERBAL>
</STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

// OFX 2.x (XML): the same four transactions and the same totals, so a test can
// assert both dialects parse identically.
export const XML_STATEMENT = `<?xml version="1.0" encoding="UTF-8"?>
<?OFX OFXHEADER="200" VERSION="211"?>
<OFX><SIGNONMSGSRSV1><SONRS>
<FI><ORG>Banco Teste</ORG><FID>001</FID></FI></SONRS></SIGNONMSGSRSV1>
<BANKMSGSRSV1><STMTTRNRS><STMTRS><CURDEF>BRL</CURDEF>
<BANKACCTFROM><BANKID>001</BANKID><ACCTID>12345-6</ACCTID>
<ACCTTYPE>CHECKING</ACCTTYPE></BANKACCTFROM>
<BANKTRANLIST><DTSTART>20260101</DTSTART><DTEND>20260228</DTEND>
<STMTTRN><DTPOSTED>20260105</DTPOSTED><TRNAMT>3000.00</TRNAMT></STMTTRN>
<STMTTRN><DTPOSTED>20260110</DTPOSTED><TRNAMT>-450.25</TRNAMT></STMTTRN>
<STMTTRN><DTPOSTED>20260212</DTPOSTED><TRNAMT>-1200.00</TRNAMT></STMTTRN>
<STMTTRN><DTPOSTED>20260220</DTPOSTED><TRNAMT>150.00</TRNAMT></STMTTRN>
</BANKTRANLIST><LEDGERBAL><BALAMT>1499.75</BALAMT><DTASOF>20260228</DTASOF>
</LEDGERBAL></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

// Two checking accounts in one file, both posting into Jan/26: +1000.00 and
// -250.00, so one row must sum across statements.
export const TWO_ACCOUNTS = `<OFX><BANKMSGSRSV1>
<STMTTRNRS><STMTRS><CURDEF>BRL
<BANKACCTFROM><BANKID>001<ACCTID>111<ACCTTYPE>CHECKING</BANKACCTFROM>
<BANKTRANLIST><DTSTART>20260101<DTEND>20260131
<STMTTRN><DTPOSTED>20260110<TRNAMT>1000.00</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS>
<STMTTRNRS><STMTRS><CURDEF>BRL
<BANKACCTFROM><BANKID>002<ACCTID>222<ACCTTYPE>SAVINGS</BANKACCTFROM>
<BANKTRANLIST><DTSTART>20260101<DTEND>20260131
<STMTTRN><DTPOSTED>20260115<TRNAMT>-250.00</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

// A credit-card export: out of scope by decision, and the file the reader has
// to refuse by name rather than by rendering an empty report.
export const CARD_ONLY = `<OFX><CREDITCARDMSGSRSV1><CCSTMTTRNRS><CCSTMTRS>
<CURDEF>BRL<CCACCTFROM><ACCTID>4111</CCACCTFROM>
<BANKTRANLIST><DTSTART>20260101<DTEND>20260131
<STMTTRN><DTPOSTED>20260110<TRNAMT>-99.90</STMTTRN>
</BANKTRANLIST></CCSTMTRS></CCSTMTTRNRS></CREDITCARDMSGSRSV1></OFX>`;
