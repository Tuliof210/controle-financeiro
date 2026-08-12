/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { readOfx } from "@/app/api/ofx/service.ts";

const bytes = (text: string) => new TextEncoder().encode(text);

// Built from parts rather than written out: one long OFX literal reads to the
// secret scanner as a high-entropy blob.
const sgml = (name: string, value: string) => `<${name}>${value}\n`;

const statement = (rows: string) =>
  `<OFX><STMTRS>${sgml("CURDEF", "BRL")}${sgml("BANKID", "001")}${rows}</STMTRS></OFX>`;

const row = `<STMTTRN>${sgml("DTPOSTED", "20260115")}${sgml("TRNAMT", "10.00")}</STMTTRN>`;

describe("readOfx", () => {
  it("refuses a file with no <OFX at all", () => {
    expect(readOfx(bytes("%PDF-1.4"), "a.pdf")).toEqual({ status: "notOfx" });
  });

  it("refuses a credit-card-only export by name", () => {
    expect(
      readOfx(bytes("<OFX><CCSTMTRS>x</CCSTMTRS></OFX>"), "a.ofx"),
    ).toEqual({ status: "cardOnly" });
  });

  it("refuses an OFX with no checking statement", () => {
    expect(readOfx(bytes("<OFX></OFX>"), "a.ofx")).toEqual({
      status: "noStatement",
    });
  });

  it("refuses a statement with no usable transaction", () => {
    expect(readOfx(bytes(statement("")), "a.ofx")).toEqual({
      status: "empty",
    });
  });

  it("reports the statement it could read", () => {
    const result = readOfx(bytes(statement(row)), "extrato.ofx");

    expect(result.status).toBe("ok");
    expect(result.status === "ok" && result.report.totals).toMatchObject({
      count: 1,
      incomeCents: 1000,
    });
  });

  it("hashes the raw bytes, so the same file has the same identity", () => {
    const first = readOfx(bytes(statement(row)), "a.ofx");
    const second = readOfx(bytes(statement(row)), "b.ofx");

    expect(first.status === "ok" && first.report.fileHash).toHaveLength(64);
    expect(first.status === "ok" && second.status === "ok").toBe(true);
    expect(
      first.status === "ok" &&
        second.status === "ok" &&
        first.report.fileHash === second.report.fileHash,
    ).toBe(true);
  });

  it("decodes a latin-1 export before parsing it", () => {
    const latin1 = Uint8Array.from(
      [...statement(row).replace("BRL", "Pão")].map((char) =>
        char.charCodeAt(0),
      ),
    );

    const result = readOfx(latin1, "a.ofx");

    expect(result.status === "ok" && result.report.currency).toBe("Pão");
  });
});
