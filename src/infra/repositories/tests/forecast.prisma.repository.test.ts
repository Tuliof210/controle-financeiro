/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { forecastRepository } from "@/infra/repositories/forecast.prisma.repository.ts";

jest.mock("@/infra/db/client.ts", () => ({
  prisma: {
    forecast: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const forecast = jest.mocked(prisma.forecast);

const row = {
  id: "f1",
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense",
  ownerId: "p1",
  simulated: false,
  createdAt: new Date(0),
  months: [{ month: 202_612 }, { month: 202_601 }],
};

const input = {
  name: "Aluguel",
  valueCents: 150_000,
  type: "expense" as const,
  ownerId: "p1",
  simulated: false,
  months: [202_601],
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("forecastRepository", () => {
  it("flattens and sorts the month rows into the entity", async () => {
    forecast.findMany.mockResolvedValue([row] as never);

    const [entity] = await forecastRepository.list();

    expect(entity.months).toEqual([202_601, 202_612]);
    expect(entity).toMatchObject({ id: "f1", type: "expense" });
  });

  it("creates the month rows alongside the forecast", async () => {
    forecast.create.mockResolvedValue(row as never);

    await forecastRepository.create(input);

    expect(forecast.create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        valueCents: input.valueCents,
        type: input.type,
        ownerId: input.ownerId,
        simulated: false,
        months: { create: [{ month: 202_601 }] },
      },
      include: { months: true },
    });
  });

  it("replaces the whole month set on update", async () => {
    forecast.update.mockResolvedValue(row as never);

    await forecastRepository.update("f1", input);

    expect(forecast.update).toHaveBeenCalledWith({
      where: { id: "f1" },
      data: expect.objectContaining({
        months: { deleteMany: {}, create: [{ month: 202_601 }] },
      }),
      include: { months: true },
    });
  });

  it("deletes without handing the row back", async () => {
    forecast.delete.mockResolvedValue({} as never);

    await expect(forecastRepository.delete("f1")).resolves.toBeUndefined();
    expect(forecast.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
  });
});
