import { describe, expect, it } from "vitest";
import { amountToCents, blocks, dateToMonth, leaf } from "./ofx-tags.helper";

describe("leaf", () => {
  // SGML omits the leaf's closing tag, XML has it, and `[^<]*` stops in the
  // same place either way — which is the whole reason one scanner reads both.
  it("reads a leaf in both dialects", () => {
    expect(leaf("<TRNAMT>-10.50\n<FITID>x", "TRNAMT")).toBe("-10.50");
    expect(leaf("<TRNAMT>-10.50</TRNAMT>", "TRNAMT")).toBe("-10.50");
  });

  it("returns null for a tag that is missing or empty", () => {
    expect(leaf("<TRNAMT>-10.50", "MEMO")).toBeNull();
    expect(leaf("<MEMO>\n<FITID>x", "MEMO")).toBeNull();
  });

  // The tag is matched with its angle brackets, so a longer tag sharing a
  // prefix is not a match — <ACCTID> must not read out of <ACCTTYPE>.
  it("does not match a tag that merely contains the name", () => {
    expect(leaf("<ACCTTYPE>CHECKING", "ACCTID")).toBeNull();
  });
});

describe("blocks", () => {
  it("reads the inner text, and nothing when the aggregate is absent", () => {
    expect(blocks("<x><T>inner</T></x>", "T")).toEqual(["inner"]);
    expect(blocks("<OFX></OFX>", "STMTTRN")).toEqual([]);
  });

  it("returns each sibling separately instead of swallowing the next", () => {
    expect(blocks("<T><A>1</T><T><A>2</T>", "T")).toEqual(["<A>1", "<A>2"]);
  });
});

describe("amountToCents", () => {
  it("reads the spec form, signed", () => {
    expect(amountToCents("-1234.56")).toBe(-123456);
    expect(amountToCents("1234.56")).toBe(123456);
    expect(amountToCents("+10.00")).toBe(1000);
  });

  it("reads the pt-BR form banks send against the spec", () => {
    expect(amountToCents("1.234,56")).toBe(123456);
  });

  it("treats a missing decimal part as whole reais, not as cents", () => {
    expect(amountToCents("1234")).toBe(123400);
  });

  it("pads a single decimal digit and truncates a third", () => {
    expect(amountToCents("1234.5")).toBe(123450);
    expect(amountToCents("1234.567")).toBe(123456);
  });

  it("keeps the sign on sub-real amounts", () => {
    expect(amountToCents("-0.01")).toBe(-1);
  });

  it("tolerates surrounding whitespace", () => {
    expect(amountToCents(" 10.00 ")).toBe(1000);
  });

  // Pinned so the ambiguity documented on the function is a decision on record
  // rather than a surprise: a lone separator plus three digits reads as
  // centavos, per the spec, not as a pt-BR thousands group.
  it("reads a lone separator as decimal even before three digits", () => {
    expect(amountToCents("1.234")).toBe(123);
  });

  // null, never 0: a 0 would be summed into a month as a real transaction of
  // nothing, and the row count would claim data that was never read.
  it("returns null rather than zero for unparseable input", () => {
    expect(amountToCents("abc")).toBeNull();
    expect(amountToCents("")).toBeNull();
    expect(amountToCents("R$ 10")).toBeNull();
    expect(amountToCents("-")).toBeNull();
  });
});

describe("dateToMonth", () => {
  it("reads the first six digits of a plain date", () => {
    expect(dateToMonth("20260715")).toBe(202607);
  });

  it("ignores the time and the timezone suffix banks append", () => {
    expect(dateToMonth("20260715120000[-3:BRT]")).toBe(202607);
  });

  it("returns null for a truncated date, an impossible month, or junk", () => {
    expect(dateToMonth("2026")).toBeNull();
    expect(dateToMonth("20261315")).toBeNull();
    expect(dateToMonth("20260015")).toBeNull();
    expect(dateToMonth("abc")).toBeNull();
  });
});
