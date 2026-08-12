import { describe, expect, it } from "@jest/globals";
import { parseOfxTags } from "@/app/ofx-decoder/_components/OfxDecoderScreen/tag-tree.helper.ts";

describe("parseOfxTags", () => {
  it("reports no tree for a file with no tag at all", () => {
    expect(parseOfxTags("not an ofx")).toEqual({ header: [], root: null });
  });

  it("turns the 1.x header lines into leaf nodes", () => {
    const { header } = parseOfxTags("OFXHEADER:100\n<OFX><A>1</A></OFX>");

    expect(header).toMatchObject([{ tag: "OFXHEADER", value: "100" }]);
  });

  it("reports no root when the header is all there is", () => {
    expect(parseOfxTags('<?xml version="1.0"?>').root).toBeNull();
  });

  it("nests an aggregate's children, however the file is indented", () => {
    const { root } = parseOfxTags("<OFX>\n  <A>1\n  <B>2\n</OFX>");

    expect(root).toMatchObject({
      tag: "OFX",
      children: [
        { tag: "A", value: "1" },
        { tag: "B", value: "2" },
      ],
    });
  });

  it("reads a closed leaf the same as an unclosed one", () => {
    const { root } = parseOfxTags("<OFX><A>1</A></OFX>");

    expect(root).toMatchObject({ children: [{ tag: "A", value: "1" }] });
  });

  it("recurses through nested aggregates", () => {
    const { root } = parseOfxTags("<OFX><OUTER><INNER>7</INNER></OUTER></OFX>");

    expect(root).toMatchObject({
      children: [{ tag: "OUTER", children: [{ tag: "INNER", value: "7" }] }],
    });
  });

  it("keeps an empty leaf rather than dropping the tag", () => {
    const { root } = parseOfxTags("<OFX><A></A></OFX>");

    expect(root).toMatchObject({ children: [{ tag: "A", value: "" }] });
  });

  it("survives a file truncated mid tag-name", () => {
    expect(parseOfxTags("<OF").root).toMatchObject({ tag: "OF", value: "" });
  });

  it("survives a tag whose value runs to the end of the file", () => {
    expect(parseOfxTags("<A>1").root).toMatchObject({ tag: "A", value: "1" });
  });

  it("keys every node so React can reconcile the tree", () => {
    const { root } = parseOfxTags("<OFX><A>1<B>2</OFX>");
    const ids =
      root && "children" in root ? root.children.map((c) => c.id) : [];

    expect(new Set(ids).size).toBe(ids.length);
  });
});
