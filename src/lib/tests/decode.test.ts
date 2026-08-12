/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { decodeOfx } from "@/lib/decode.ts";

describe("decodeOfx", () => {
  it("decodes UTF-8 bytes as UTF-8", () => {
    const bytes = new TextEncoder().encode("<MEMO>Pão de queijo");

    expect(decodeOfx(bytes)).toBe("<MEMO>Pão de queijo");
  });

  it("falls back to windows-1252 when the bytes are not valid UTF-8", () => {
    // 0xE3 alone is "ã" in latin-1 and an invalid UTF-8 lead byte.
    const bytes = Uint8Array.from([0x50, 0xe3, 0x6f]);

    expect(decodeOfx(bytes)).toBe("Pão");
  });

  it("decodes the windows-1252-only range too", () => {
    // 0x93/0x94 are curly quotes in windows-1252 and unassigned in latin-1.
    const bytes = Uint8Array.from([0x93, 0x41, 0x94]);

    expect(decodeOfx(bytes)).toBe("“A”");
  });
});
