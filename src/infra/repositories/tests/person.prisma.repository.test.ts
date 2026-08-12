/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import { prisma } from "@/infra/db/client.ts";
import { personRepository } from "@/infra/repositories/person.prisma.repository.ts";

jest.mock("@/infra/db/client.ts", () => ({
  prisma: {
    person: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const person = jest.mocked(prisma.person);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("personRepository", () => {
  it("lists in creation order", async () => {
    person.findMany.mockResolvedValue([{ id: "p1" }] as never);

    await expect(personRepository.list()).resolves.toEqual([{ id: "p1" }]);
    expect(person.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: "asc" },
    });
  });

  it("creates from the input as-is", async () => {
    person.create.mockResolvedValue({ id: "p1" } as never);
    const input = { name: "Ana", color: "violet" };

    await expect(personRepository.create(input)).resolves.toEqual({
      id: "p1",
    });
    expect(person.create).toHaveBeenCalledWith({ data: input });
  });

  it("updates the row the id names", async () => {
    person.update.mockResolvedValue({ id: "p1" } as never);

    await personRepository.update("p1", { name: "Ana", color: "lime" });

    expect(person.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { name: "Ana", color: "lime" },
    });
  });

  it("deletes without handing the row back", async () => {
    person.delete.mockResolvedValue({} as never);

    await expect(personRepository.delete("p1")).resolves.toBeUndefined();
    expect(person.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
  });
});
