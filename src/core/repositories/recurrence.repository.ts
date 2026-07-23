import type { Recurrence } from "@/core/entities/recurrence.entity";

export type RecurrenceInput = {
  name: string;
  valueCents: number;
  type: "income" | "expense";
  ownerId: string;
  rangeStart: number;
  rangeEnd: number;
};

export type RecurrenceRepository = {
  list(): Promise<Recurrence[]>;
  create(input: RecurrenceInput): Promise<Recurrence>;
  update(id: string, patch: RecurrenceInput): Promise<Recurrence>;
  delete(id: string): Promise<void>;
};
