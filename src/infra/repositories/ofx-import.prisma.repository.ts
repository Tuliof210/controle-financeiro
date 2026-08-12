import type { OfxImportRepository } from "@/core/repositories/ofx-import.repository.ts";
import { prisma } from "@/infra/db/client.ts";

export const ofxImportRepository: OfxImportRepository = {
  findByHash(fileHash) {
    return prisma.ofxImport.findUnique({ where: { fileHash } });
  },
  // The only transaction in this codebase. It has to be the interactive form:
  // the unique fileHash and every movement's owner FK are both enforced by
  // SQLite mid-write, and a half-written batch would leave movements the user
  // cannot trace back to any file. createMany answers { count }, never rows.
  create({ fileHash, fileName, movements }) {
    return prisma.$transaction(async (tx) => {
      await tx.ofxImport.create({ data: { fileHash, fileName } });
      const { count } = await tx.movement.createMany({ data: movements });
      return count;
    });
  },
};
