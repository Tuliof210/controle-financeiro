import type { Movement } from "@/core/entities/movement.entity.ts";
import type { EntryType } from "@/lib/entry-types.ts";

export interface MovementInput {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  month: number; // YYYYMM
}

export interface MovementRepository {
  list(): Promise<Movement[]>;
  create(input: MovementInput): Promise<Movement>;
  update(id: string, patch: MovementInput): Promise<Movement>;
  delete(id: string): Promise<void>;
}
