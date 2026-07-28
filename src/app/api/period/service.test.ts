import { describe, expect, it, vi } from "vitest";

vi.mock("@/infra/repositories/movement.prisma.repository", () => ({
  movementRepository: { list: vi.fn() },
}));
vi.mock("@/infra/repositories/recurrence.prisma.repository", () => ({
  recurrenceRepository: { list: vi.fn() },
}));

import { movementRepository } from "@/infra/repositories/movement.prisma.repository";
import { recurrenceRepository } from "@/infra/repositories/recurrence.prisma.repository";
import { getPeriod } from "./service";

const movement = (month: number) => ({
  id: "m1",
  name: "m",
  valueCents: 100,
  type: "income" as const,
  ownerId: "p1",
  month,
  createdAt: new Date(0),
});

const recurrence = (months: number[]) => ({
  id: "r1",
  name: "r",
  valueCents: 100,
  type: "income" as const,
  ownerId: "p1",
  months,
  createdAt: new Date(0),
});

describe("period service", () => {
  it("derives the period from both repositories' lists", async () => {
    vi.mocked(movementRepository.list).mockResolvedValue([movement(202603)]);
    vi.mocked(recurrenceRepository.list).mockResolvedValue([
      recurrence([202601, 202602]),
    ]);

    expect(await getPeriod()).toEqual({ start: 202601, end: 202603 });
  });

  it("returns null when both repositories are empty", async () => {
    vi.mocked(movementRepository.list).mockResolvedValue([]);
    vi.mocked(recurrenceRepository.list).mockResolvedValue([]);

    expect(await getPeriod()).toBeNull();
  });
});
