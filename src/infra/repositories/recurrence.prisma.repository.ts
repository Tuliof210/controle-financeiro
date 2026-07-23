import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { RecurrenceRepository } from "@/core/repositories/recurrence.repository";
import { prisma } from "@/infra/db/client";

// ponytail: Prisma has no enum for `type` (project convention — see schema
// comment), so the client sees `string`, not the domain union. Zod already
// guards it at the route boundary, so a narrowing cast here is safe.
export const recurrenceRepository: RecurrenceRepository = {
  list() {
    return prisma.recurrence.findMany({
      orderBy: { createdAt: "asc" },
    }) as Promise<Recurrence[]>;
  },
  create(input) {
    return prisma.recurrence.create({ data: input }) as Promise<Recurrence>;
  },
  update(id, patch) {
    return prisma.recurrence.update({
      where: { id },
      data: patch,
    }) as Promise<Recurrence>;
  },
  async delete(id) {
    await prisma.recurrence.delete({ where: { id } });
  },
};
