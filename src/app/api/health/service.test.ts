import { describe, expect, it } from "vitest";
import { getHealth } from "./service";

describe("getHealth", () => {
  it("reports ok", () => {
    expect(getHealth()).toEqual({ status: "ok" });
  });
});
