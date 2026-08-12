import type { GoalRepository } from "@/core/repositories/goal.repository.ts";
import { prisma } from "@/infra/db/client.ts";

export const goalRepository: GoalRepository = {
  list() {
    return prisma.goal.findMany({ orderBy: { createdAt: "asc" } });
  },
  create(input) {
    return prisma.goal.create({ data: input });
  },
  update(id, patch) {
    return prisma.goal.update({ where: { id }, data: patch });
  },
  async delete(id) {
    await prisma.goal.delete({ where: { id } });
  },
};
