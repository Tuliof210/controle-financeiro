import type { Movement } from "@/core/entities/movement.entity";
import type { EntryType } from "@/lib/entry-types";

export type MovementInput = {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  month: number; // YYYYMM
};

export type MovementRepository = {
  list(): Promise<Movement[]>;
  create(input: MovementInput): Promise<Movement>;
  update(id: string, patch: MovementInput): Promise<Movement>;
  delete(id: string): Promise<void>;
};
