/**
 * @jest-environment node
 */
import { describe, expect, it } from "@jest/globals";
import { getHealth } from "@/app/api/health/service.ts";

describe("getHealth", () => {
  it("answers ok without touching anything", () => {
    expect(getHealth()).toEqual({ status: "ok" });
  });
});
