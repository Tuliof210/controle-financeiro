import { describe, expect, it } from "vitest";
import { SGML_STATEMENT, XML_STATEMENT } from "@/app/api/ofx/fixtures.helper";
import { type OfxNode, parseOfxTags } from "./tag-tree.helper";

const value = (node: OfxNode | undefined): string | undefined =>
  node && "value" in node ? node.value : undefined;

// Depth-first, first match — enough to reach into a fixture without spelling
// out every intermediate aggregate by name.
function find(node: OfxNode, tag: string): OfxNode | undefined {
  if (node.tag === tag) {
    return node;
  }
  if (!("children" in node)) {
    return undefined;
  }
  for (const child of node.children) {
    const hit = find(child, tag);
    if (hit) {
      return hit;
    }
  }
  return undefined;
}

describe("parseOfxTags", () => {
  it("reads the 1.x SGML header and the tree, values untouched", () => {
    const { header, root } = parseOfxTags(SGML_STATEMENT);
    expect(header.map((h) => [h.tag, value(h)])).toEqual([
      ["OFXHEADER", "100"],
      ["DATA", "OFXSGML"],
      ["VERSION", "102"],
      ["CHARSET", "1252"],
    ]);
    expect(root?.tag).toBe("OFX");
    const stmttrn = root && find(root, "STMTTRN");
    expect(value(stmttrn && find(stmttrn, "MEMO"))).toBe("Salario");
    // Not 300000 cents, not a Date — the raw spec-form string, unconverted.
    expect(value(stmttrn && find(stmttrn, "TRNAMT"))).toBe("3000.00");
  });

  it("reads the 2.x XML header and the same tree", () => {
    const { header, root } = parseOfxTags(XML_STATEMENT);
    expect(header.map((h) => h.tag)).toEqual(["xml", "OFX"]);
    expect(value(header[1])).toBe('OFXHEADER="200" VERSION="211"');
    const stmttrn = root && find(root, "STMTTRN");
    expect(value(stmttrn && find(stmttrn, "TRNAMT"))).toBe("3000.00");
  });

  // 1.x aggregates ARE always closed by spec, but a hand-truncated file is
  // exactly what a page reload after a bad drop can produce — no throw, no
  // hang, and whatever DID arrive still reads out.
  it("returns a partial tree for an aggregate that never closes", () => {
    const { root } = parseOfxTags("<OFX><STMTTRN><TRNTYPE>DEBIT");
    expect(value(root && find(root, "TRNTYPE"))).toBe("DEBIT");
  });

  // <ACCTID> must not read out of <ACCTTYPE> the way a per-tag regex could —
  // this scanner never constructs one, but the case is worth pinning.
  it("does not let a tag name bleed into one that prefixes it", () => {
    const { root } = parseOfxTags(
      "<OFX><ACCTID>12345<ACCTTYPE>CHECKING</ACCTTYPE></OFX>",
    );
    expect(value(root && find(root, "ACCTID"))).toBe("12345");
    expect(value(root && find(root, "ACCTTYPE"))).toBe("CHECKING");
  });

  it("keeps an accented value intact", () => {
    const { root } = parseOfxTags("<OFX><MEMO>Descrição: café</MEMO></OFX>");
    expect(value(root && find(root, "MEMO"))).toBe("Descrição: café");
  });

  // Forbidden: dropping or merging what the file actually contains.
  it("keeps duplicate tags and empty leaves, never merged or dropped", () => {
    const { root } = parseOfxTags("<OFX><MEMO></MEMO><MEMO>x</MEMO></OFX>");
    const memos = root && "children" in root ? root.children : [];
    expect(memos.map((m) => value(m))).toEqual(["", "x"]);
  });

  it("returns a null root and no header for a file with no tags at all", () => {
    expect(parseOfxTags("not an ofx file")).toEqual({ header: [], root: null });
  });
});
