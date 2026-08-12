/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { getPeriod } from "@/app/api/period/service.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";

jest.mock("@/infra/repositories/movement.prisma.repository.ts", () => ({
  movementRepository: { list: jest.fn() },
}));
jest.mock("@/infra/repositories/forecast.prisma.repository.ts", () => ({
  forecastRepository: { list: jest.fn() },
}));

const movements = jest.mocked(movementRepository);
const forecasts = jest.mocked(forecastRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("getPeriod", () => {
  it("derives the span from both repositories", async () => {
    movements.list.mockResolvedValue([{ month: 202_605 }] as never);
    forecasts.list.mockResolvedValue([{ months: [202_612] }] as never);

    await expect(getPeriod()).resolves.toEqual({
      start: 202_605,
      end: 202_612,
    });
  });

  it("answers null when neither repository has anything", async () => {
    movements.list.mockResolvedValue([]);
    forecasts.list.mockResolvedValue([]);

    await expect(getPeriod()).resolves.toBeNull();
  });
});
