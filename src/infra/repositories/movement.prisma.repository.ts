import type { Movement } from "@/core/entities/movement.entity";
import type { MovementRepository } from "@/core/repositories/movement.repository";
import { prisma } from "@/infra/db/client";

// ponytail: Prisma has no enum for `type` (project convention — see schema),
// so a row sees `string`, not the domain union. Zod guards it at the route
// boundary, so the narrowing cast here is safe.
export const movementRepository: MovementRepository = {
  list() {
    return prisma.movement.findMany({
      orderBy: { createdAt: "asc" },
    }) as Promise<Movement[]>;
  },
  create(input) {
    return prisma.movement.create({ data: input }) as Promise<Movement>;
  },
  update(id, patch) {
    return prisma.movement.update({
      where: { id },
      data: patch,
    }) as Promise<Movement>;
  },
  async delete(id) {
    await prisma.movement.delete({ where: { id } });
  },
};
