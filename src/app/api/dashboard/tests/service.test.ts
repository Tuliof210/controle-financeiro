/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getDashboard } from "@/app/api/dashboard/service.ts";
import { currentYyyymm } from "@/lib/months.ts";
import { NOW, seed } from "./dashboard-repositories.ts";

jest.mock("@/infra/repositories/movement.prisma.repository.ts", () => ({
  movementRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/forecast.prisma.repository.ts", () => ({
  forecastRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/goal.prisma.repository.ts", () => ({
  goalRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/settings.prisma.repository.ts", () => ({
  settingsRepository: { get: jest.fn() },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getDashboard", () => {
  it("answers no_range on an empty database", async () => {
    seed({ movements: [] });

    await expect(getDashboard("familia", "50", "real")).resolves.toEqual({
      status: "no_range",
    });
  });

  it("answers out_of_range when today falls outside the derived span", async () => {
    seed({ month: 200_001 });

    const data = await getDashboard("familia", "50", "real");

    expect(data.status).toBe("out_of_range");
    expect(data.status === "out_of_range" && data.range.current).toBe(
      currentYyyymm(),
    );
  });

  it("answers ok when today is inside the span", async () => {
    seed();

    const data = await getDashboard("familia", "50", "real");

    expect(data.status).toBe("ok");
    expect(data.status === "ok" && data.range).toEqual({
      start: NOW,
      end: NOW,
      current: NOW,
    });
  });
});
