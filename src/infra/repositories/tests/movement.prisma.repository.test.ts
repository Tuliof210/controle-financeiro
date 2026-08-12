/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";

jest.mock("../../db/client.ts", () => ({
  prisma: {
    movement: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const movement = jest.mocked(prisma.movement);

const input = {
  name: "Mercado",
  valueCents: 1000,
  type: "expense" as const,
  month: 202_608,
  ownerId: "p1",
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("movementRepository", () => {
  it("lists in creation order", async () => {
    movement.findMany.mockResolvedValue([{ id: "m1" }] as never);

    await expect(movementRepository.list()).resolves.toEqual([{ id: "m1" }]);
    expect(movement.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
  });

  it("creates from the input as-is", async () => {
    movement.create.mockResolvedValue({ id: "m1" } as never);

    await expect(movementRepository.create(input)).resolves.toEqual({
      id: "m1",
    });
    expect(movement.create).toHaveBeenCalledWith({ data: input });
  });

  it("updates the row the id names", async () => {
    movement.update.mockResolvedValue({ id: "m1" } as never);

    await movementRepository.update("m1", input);

    expect(movement.update).toHaveBeenCalledWith({
      where: { id: "m1" },
      data: input,
    });
  });

  it("deletes without handing the row back", async () => {
    movement.delete.mockResolvedValue({} as never);

    await expect(movementRepository.delete("m1")).resolves.toBeUndefined();
    expect(movement.delete).toHaveBeenCalledWith({ where: { id: "m1" } });
  });
});
