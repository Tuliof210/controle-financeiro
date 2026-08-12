import type { MovementInput } from "@/core/repositories/movement.repository.ts";
import { ofxImportRepository } from "@/infra/repositories/ofx-import.prisma.repository.ts";
import type { MovementRow } from "@/lib/movement-schema.ts";

export interface ImportOfxInput {
  fileHash: string;
  fileName: string;
  ownerId: string;
  movements: MovementRow[];
}

export async function isOfxImported(fileHash: string) {
  const found = await ofxImportRepository.findByHash(fileHash);
  return { imported: found !== null, importedAt: found?.importedAt ?? null };
}

// Answers null when the file is already on record, so the route can map that to
// its own status without knowing what a repository lookup looks like. This is a
// check-then-write, so the unique index on fileHash — not this branch — is what
// actually makes a double import impossible.
export async function importOfx({
  fileHash,
  fileName,
  ownerId,
  movements,
}: ImportOfxInput): Promise<number | null> {
  if (await ofxImportRepository.findByHash(fileHash)) {
    return null;
  }

  const rows: MovementInput[] = movements.map((row) => ({ ...row, ownerId }));
  return ofxImportRepository.create({ fileHash, fileName, movements: rows });
}
