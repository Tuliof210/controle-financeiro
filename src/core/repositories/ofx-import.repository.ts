import type { OfxImport } from "@/core/entities/ofx-import.entity.ts";
import type { MovementInput } from "@/core/repositories/movement.repository.ts";

export interface OfxImportInput {
  fileHash: string;
  fileName: string;
  movements: MovementInput[];
}

export interface OfxImportRepository {
  findByHash: (fileHash: string) => Promise<OfxImport | null>;
  // Writes the movements and the import record together or not at all, and
  // answers how many movements landed.
  create: (input: OfxImportInput) => Promise<number>;
}
