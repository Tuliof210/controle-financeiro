import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/movement.prisma.repository", () => ({
  movementRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import {
  createMovement,
  deleteMovement,
  listMovements,
  updateMovement,
} from "./service";

const input = {
  name: "Salário",
  valueCents: 500000,
  type: "income" as const,
  ownerId: "p1",
  month: 202608,
};

describe("movements service", () => {
  it("listMovements delegates to the repository", async () => {
    vi.mocked(movementRepository.list).mockResolvedValue([]);
    await listMovements();
    expect(movementRepository.list).toHaveBeenCalledOnce();
  });

  it("createMovement delegates to the repository with the given input", async () => {
    vi.mocked(movementRepository.create).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await createMovement(input);
    expect(movementRepository.create).toHaveBeenCalledWith(input);
  });

  it("updateMovement delegates to the repository with id and patch", async () => {
    vi.mocked(movementRepository.update).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await updateMovement({ id: "1", ...input });
    expect(movementRepository.update).toHaveBeenCalledWith("1", input);
  });

  it("deleteMovement delegates to the repository with the given id", async () => {
    await deleteMovement("1");
    expect(movementRepository.delete).toHaveBeenCalledWith("1");
  });
});
