import type { Movement } from "@/core/entities/movement.entity";

export type MovementInput = {
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  month: number; // YYYYMM
};

export type MovementRepository = {
  list(): Promise<Movement[]>;
  create(input: MovementInput): Promise<Movement>;
  update(id: string, patch: MovementInput): Promise<Movement>;
  delete(id: string): Promise<void>;
};
