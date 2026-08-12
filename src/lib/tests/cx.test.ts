/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { cx } from "@/lib/cx.ts";

describe("cx", () => {
  it("joins the names that apply with a single space", () => {
    expect(cx("row", "active")).toBe("row active");
  });

  it("drops the falsy results of a `cond && styles.x`", () => {
    expect(cx("row", false, undefined, null, "on")).toBe("row on");
  });

  it("yields an empty string when nothing applies", () => {
    expect(cx(false, undefined)).toBe("");
  });
});
