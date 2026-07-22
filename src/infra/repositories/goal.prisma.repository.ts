import type { GoalRepository } from "@/core/repositories/goal.repository";
import { prisma } from "@/infra/db/client";

export const goalRepository: GoalRepository = {
  list() {
    return prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
  },
  create(input) {
    return prisma.goal.create({ data: input });
  },
  async delete(id) {
    await prisma.goal.delete({ where: { id } });
  },
};
