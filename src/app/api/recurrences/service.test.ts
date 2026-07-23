import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/recurrence.prisma.repository", () => ({
  recurrenceRepository: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";
import {
  createRecurrence,
  deleteRecurrence,
  listRecurrences,
  updateRecurrence,
} from "./service";

const input = {
  name: "Salário",
  valueCents: 500000,
  type: "income" as const,
  ownerId: "p1",
  rangeStart: 202608,
  rangeEnd: 202612,
};

describe("recurrences service", () => {
  it("listRecurrences delegates to the repository", async () => {
    vi.mocked(recurrenceRepository.list).mockResolvedValue([]);
    await listRecurrences();
    expect(recurrenceRepository.list).toHaveBeenCalledOnce();
  });

  it("createRecurrence delegates to the repository with the given input", async () => {
    vi.mocked(recurrenceRepository.create).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await createRecurrence(input);
    expect(recurrenceRepository.create).toHaveBeenCalledWith(input);
  });

  it("updateRecurrence delegates to the repository with id and patch", async () => {
    vi.mocked(recurrenceRepository.update).mockResolvedValue({
      id: "1",
      ...input,
      createdAt: new Date(),
    });
    await updateRecurrence({ id: "1", ...input });
    expect(recurrenceRepository.update).toHaveBeenCalledWith("1", input);
  });

  it("deleteRecurrence delegates to the repository with the given id", async () => {
    await deleteRecurrence("1");
    expect(recurrenceRepository.delete).toHaveBeenCalledWith("1");
  });
});
