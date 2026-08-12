import { describe, expect, it } from "@jest/globals";
import {
  aggregate,
  leaf,
  resetIds,
} from "@/app/ofx-decoder/_components/OfxDecoderScreen/tag-node.helper.ts";

describe("leaf", () => {
  it("trims the formatting a pretty-printed file leaves in the value", () => {
    resetIds();

    expect(leaf("CURDEF", "  BRL\n  ")).toEqual({
      id: 0,
      tag: "CURDEF",
      value: "BRL",
    });
  });
});

describe("aggregate", () => {
  it("keys itself after its children", () => {
    resetIds();
    const child = leaf("A", "1");

    expect(aggregate("OFX", [child])).toEqual({
      id: 1,
      tag: "OFX",
      children: [child],
    });
  });
});

describe("resetIds", () => {
  it("makes a re-read of the same file yield the same keys", () => {
    resetIds();
    const first = leaf("A", "1");
    leaf("B", "2");

    resetIds();

    expect(leaf("A", "1")).toEqual(first);
  });
});
