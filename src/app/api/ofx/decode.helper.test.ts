import { describe, expect, it } from "vitest";
import { decodeOfx } from "./decode.helper";

describe("decodeOfx", () => {
  it("reads plain ASCII unchanged", () => {
    expect(decodeOfx(new TextEncoder().encode("<OFX><ORG>Banco"))).toBe(
      "<OFX><ORG>Banco",
    );
  });

  it("reads UTF-8 accents", () => {
    expect(decodeOfx(new Uint8Array([0xc3, 0xa7, 0xc3, 0xa3, 0x6f]))).toBe(
      "ção",
    );
  });

  // 0xe7 opens a 3-byte UTF-8 sequence that never arrives, so the strict
  // decoder throws — and that throw is what identifies the file as latin-1.
  it("falls back to latin-1 when the bytes are not valid UTF-8", () => {
    expect(decodeOfx(new Uint8Array([0xe7, 0xe3, 0xf5]))).toBe("çãõ");
  });

  it("reads an empty file as an empty string", () => {
    expect(decodeOfx(new Uint8Array([]))).toBe("");
  });
});
