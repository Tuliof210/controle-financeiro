/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { GET } from "@/app/api/period/route.ts";
import { getPeriod } from "@/app/api/period/service.ts";

jest.mock("@/app/api/period/service.ts", () => ({ getPeriod: jest.fn() }));

const period = jest.mocked(getPeriod);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("GET", () => {
  it("wraps the derived period in the data envelope", async () => {
    period.mockResolvedValue({ start: 202_601, end: 202_612 });
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      data: { start: 202_601, end: 202_612 },
    });
  });

  it("passes null through as a legitimate answer", async () => {
    period.mockResolvedValue(null);

    expect(await (await GET()).json()).toEqual({ data: null });
  });

  it("answers 500 when the service throws", async () => {
    period.mockRejectedValue(new Error("db"));
    const res = await GET();

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ error: { code: "internal" } });
  });
});
