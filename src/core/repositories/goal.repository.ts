import type { Goal } from "@/core/entities/goal.entity";

export type GoalRepository = {
  list(): Promise<Goal[]>;
  create(input: { name: string; targetCents: number }): Promise<Goal>;
  update(
    id: string,
    patch: { name: string; targetCents: number },
  ): Promise<Goal>;
  delete(id: string): Promise<void>;
};
