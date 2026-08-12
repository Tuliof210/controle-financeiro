/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";

jest.mock("../../db/client.ts", () => ({
  prisma: {
    goal: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const goal = jest.mocked(prisma.goal);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("goalRepository", () => {
  it("lists in creation order", async () => {
    goal.findMany.mockResolvedValue([{ id: "g1" }] as never);

    await expect(goalRepository.list()).resolves.toEqual([{ id: "g1" }]);
    expect(goal.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
  });

  it("creates from the input as-is", async () => {
    goal.create.mockResolvedValue({ id: "g1" } as never);
    const input = { name: "Casa", targetCents: 5000 };

    await expect(goalRepository.create(input)).resolves.toEqual({ id: "g1" });
    expect(goal.create).toHaveBeenCalledWith({ data: input });
  });

  it("updates the row the id names", async () => {
    goal.update.mockResolvedValue({ id: "g1" } as never);

    await goalRepository.update("g1", { name: "Casa", targetCents: 1 });

    expect(goal.update).toHaveBeenCalledWith({
      where: { id: "g1" },
      data: { name: "Casa", targetCents: 1 },
    });
  });

  it("deletes without handing the row back", async () => {
    goal.delete.mockResolvedValue({} as never);

    await expect(goalRepository.delete("g1")).resolves.toBeUndefined();
    expect(goal.delete).toHaveBeenCalledWith({ where: { id: "g1" } });
  });
});
