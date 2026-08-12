import { describe, expect, it } from "@jest/globals";
import {
  readHeader,
  skipWs,
} from "@/app/ofx-decoder/_components/OfxDecoderScreen/header.helper.ts";

describe("skipWs", () => {
  it("lands on the next non-space character", () => {
    expect(skipWs("  \n\t<OFX>", 0)).toBe(4);
  });

  it("stays put when already on one", () => {
    expect(skipWs("<OFX>", 0)).toBe(0);
  });

  it("stops at the end of the text", () => {
    expect(skipWs("   ", 0)).toBe(3);
  });
});

describe("readHeader", () => {
  it("reads the 1.x KEY:VALUE lines before the first tag", () => {
    const text = "OFXHEADER:100\nDATA:OFXSGML\n<OFX>";

    expect(readHeader(text, text.indexOf("<"))).toEqual({
      entries: [
        { key: "OFXHEADER", value: "100" },
        { key: "DATA", value: "OFXSGML" },
      ],
      next: text.indexOf("<"),
    });
  });

  it("reads the 2.x processing instructions, dropping the closing ?", () => {
    const text = '<?xml version="1.0"?><?OFX OFXHEADER="200"?><OFX>';

    const { entries, next } = readHeader(text, 0);

    expect(entries).toEqual([
      { key: "xml", value: 'version="1.0"' },
      { key: "OFX", value: 'OFXHEADER="200"' },
    ]);
    expect(text.slice(next)).toBe("<OFX>");
  });

  it("takes a header line with no colon as a bare key", () => {
    const text = "GARBAGE\n<OFX>";

    expect(readHeader(text, text.indexOf("<")).entries).toEqual([
      { key: "GARBAGE", value: "" },
    ]);
  });

  it("reports no entry for a file that opens straight on its root tag", () => {
    expect(readHeader("<OFX>", 0).entries).toEqual([]);
  });

  it("stops at an unterminated instruction", () => {
    const text = "<?xml version";

    expect(readHeader(text, 0)).toEqual({ entries: [], next: text.length });
  });
});
