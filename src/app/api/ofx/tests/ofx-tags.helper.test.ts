/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { blocks, leaf } from "@/app/api/ofx/ofx-tags.helper.ts";

// Built from parts rather than written out: one long OFX literal reads to the
// secret scanner as a high-entropy blob.
const open = (name: string) => `<${name}>`;
const sgml = (name: string, value: string) => `${open(name)}${value}\n`;
const xml = (name: string, value: string) => `${open(name)}${value}</${name}>`;

describe("leaf", () => {
  it("reads an SGML leaf that runs to the next tag", () => {
    const block = sgml("CURDEF", "BRL") + sgml("BANKID", "001");

    expect(leaf(block, "CURDEF")).toBe("BRL");
  });

  it("reads an XML leaf that closes itself", () => {
    expect(leaf(xml("CURDEF", "BRL"), "CURDEF")).toBe("BRL");
  });

  it("trims the value", () => {
    expect(leaf(sgml("ORG", "  Banco  "), "ORG")).toBe("Banco");
  });

  it("reads an empty or whitespace-only leaf as absent", () => {
    expect(leaf(xml("ORG", ""), "ORG")).toBeNull();
    expect(leaf(sgml("ORG", "   "), "ORG")).toBeNull();
  });

  it("returns null when the tag is not there", () => {
    expect(leaf(sgml("CURDEF", "BRL"), "ORG")).toBeNull();
  });
});

describe("blocks", () => {
  it("returns the inner text of every occurrence", () => {
    expect(blocks(xml("A", "one") + xml("A", "two"), "A")).toEqual([
      "one",
      "two",
    ]);
  });

  it("takes the nearest close and resumes past it", () => {
    const text = `x${xml("A", "one")}y${xml("A", "two")}z`;

    expect(blocks(text, "A")).toEqual(["one", "two"]);
  });

  it("stops at an unclosed aggregate", () => {
    expect(blocks(`${xml("A", "one")}${open("A")}dangling`, "A")).toEqual([
      "one",
    ]);
  });

  it("returns [] when the tag never opens", () => {
    expect(blocks(xml("B", "one"), "A")).toEqual([]);
  });

  it("does not rescan on a file full of unclosed opening tags", () => {
    expect(blocks(open("A").repeat(10_000), "A")).toEqual([]);
  });
});
