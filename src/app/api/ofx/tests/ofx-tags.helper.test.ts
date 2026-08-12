/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { blocks, leaf } from "@/app/api/ofx/ofx-tags.helper.ts";

describe("leaf", () => {
  it("reads an SGML leaf that runs to the next tag", () => {
    expect(leaf("<CURDEF>BRL\n<BANKID>001", "CURDEF")).toBe("BRL");
  });

  it("reads an XML leaf that closes itself", () => {
    expect(leaf("<CURDEF>BRL</CURDEF>", "CURDEF")).toBe("BRL");
  });

  it("trims the value", () => {
    expect(leaf("<ORG>  Banco  \n", "ORG")).toBe("Banco");
  });

  it("reads an empty or whitespace-only leaf as absent", () => {
    expect(leaf("<ORG></ORG>", "ORG")).toBeNull();
    expect(leaf("<ORG>   \n", "ORG")).toBeNull();
  });

  it("returns null when the tag is not there", () => {
    expect(leaf("<CURDEF>BRL", "ORG")).toBeNull();
  });
});

describe("blocks", () => {
  it("returns the inner text of every occurrence", () => {
    expect(blocks("<A>one</A><A>two</A>", "A")).toEqual(["one", "two"]);
  });

  it("takes the nearest close and resumes past it", () => {
    expect(blocks("x<A>one</A>y<A>two</A>z", "A")).toEqual(["one", "two"]);
  });

  it("stops at an unclosed aggregate", () => {
    expect(blocks("<A>one</A><A>dangling", "A")).toEqual(["one"]);
  });

  it("returns [] when the tag never opens", () => {
    expect(blocks("<B>one</B>", "A")).toEqual([]);
  });

  it("does not rescan on a file full of unclosed opening tags", () => {
    expect(blocks("<A>".repeat(10_000), "A")).toEqual([]);
  });
});
