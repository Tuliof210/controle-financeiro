import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/goal.prisma.repository", () => ({
  goalRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { goalRepository } from "@/infra/repositories/goal.prisma.repository";
import { createGoal, deleteGoal, listGoals, updateGoal } from "./service";

describe("goals service", () => {
  it("listGoals delegates to the repository", async () => {
    vi.mocked(goalRepository.list).mockResolvedValue([]);
    await listGoals();
    expect(goalRepository.list).toHaveBeenCalledOnce();
  });

  it("createGoal delegates to the repository with the given input", async () => {
    const input = { name: "Viagem", targetCents: 500000 };
    vi.mocked(goalRepository.create).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await createGoal(input);
    expect(goalRepository.create).toHaveBeenCalledWith(input);
  });

  it("updateGoal delegates to the repository with id and patch", async () => {
    const patch = { name: "Viagem", targetCents: 500000 };
    vi.mocked(goalRepository.update).mockResolvedValue({
      id: "1",
      ...patch,
      createdAt: new Date(),
    });
    await updateGoal({ id: "1", ...patch });
    expect(goalRepository.update).toHaveBeenCalledWith("1", patch);
  });

  it("deleteGoal delegates to the repository with the given id", async () => {
    await deleteGoal("1");
    expect(goalRepository.delete).toHaveBeenCalledWith("1");
  });
});
