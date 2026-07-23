import type { PersonRepository } from "@/core/repositories/person.repository";
import { prisma } from "@/infra/db/client";

export const personRepository: PersonRepository = {
  list() {
    return prisma.person.findMany({ orderBy: { createdAt: "asc" } });
  },
  create(input) {
    return prisma.person.create({ data: input });
  },
  update(id, patch) {
    return prisma.person.update({ where: { id }, data: patch });
  },
  async delete(id) {
    await prisma.person.delete({ where: { id } });
  },
};
