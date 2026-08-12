/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement,
} from "@/app/api/movements/service.ts";
import { movementRepository } from "@/infra/repositories/movement.prisma.repository.ts";

jest.mock("@/infra/repositories/movement.prisma.repository.ts", () => ({
  movementRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const repository = jest.mocked(movementRepository);

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

describe("listMovements", () => {
  it("hands the repository's list straight back", async () => {
    repository.list.mockResolvedValue([{ id: "m1" }] as never);

    await expect(listMovements()).resolves.toEqual([{ id: "m1" }]);
  });
});

describe("createMovement", () => {
  it("passes the whole row through", async () => {
    repository.create.mockResolvedValue({ id: "m1" } as never);

    await expect(createMovement(input)).resolves.toEqual({ id: "m1" });
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});

describe("updateMovement", () => {
  it("splits the id off the patch", async () => {
    repository.update.mockResolvedValue({ id: "m1" } as never);

    await updateMovement({ ...input, id: "m1" });

    expect(repository.update).toHaveBeenCalledWith("m1", input);
  });
});

describe("deleteMovement", () => {
  it("forwards the id", async () => {
    repository.delete.mockResolvedValue(undefined);

    await deleteMovement("m1");

    expect(repository.delete).toHaveBeenCalledWith("m1");
  });
});
