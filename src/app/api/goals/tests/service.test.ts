/**
 * @jest-environment node
 */
import { beforeEach, describe, expect, it } from "@jest/globals";
import {
  createGoal,
  deleteGoal,
  listGoals,
  updateGoal,
} from "@/app/api/goals/service.ts";
import { goalRepository } from "@/infra/repositories/goal.prisma.repository.ts";

jest.mock("@/infra/repositories/goal.prisma.repository.ts", () => ({
  goalRepository: {
    list: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const repository = jest.mocked(goalRepository);

beforeEach(() => {
  jest.clearAllMocks();
});

describe("listGoals", () => {
  it("hands the repository's list straight back", async () => {
    repository.list.mockResolvedValue([{ id: "g1" }] as never);

    await expect(listGoals()).resolves.toEqual([{ id: "g1" }]);
  });
});

describe("createGoal", () => {
  it("passes name and target through", async () => {
    repository.create.mockResolvedValue({ id: "g1" } as never);
    const input = { name: "Casa", targetCents: 5000 };

    await expect(createGoal(input)).resolves.toEqual({ id: "g1" });
    expect(repository.create).toHaveBeenCalledWith(input);
  });
});

describe("updateGoal", () => {
  it("splits the id off the patch", async () => {
    repository.update.mockResolvedValue({ id: "g1" } as never);

    await updateGoal({ id: "g1", name: "Casa", targetCents: 900 });

    expect(repository.update).toHaveBeenCalledWith("g1", {
      name: "Casa",
      targetCents: 900,
    });
  });
});

describe("deleteGoal", () => {
  it("forwards the id", async () => {
    repository.delete.mockResolvedValue(undefined);

    await deleteGoal("g1");

    expect(repository.delete).toHaveBeenCalledWith("g1");
  });
});
