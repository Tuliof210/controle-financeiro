import type {
  Recurrence,
  RecurrenceKind,
} from "@/core/entities/recurrence.entity";
import type { EntryType } from "@/lib/entry-types";

export type RecurrenceInput = {
  name: string;
  valueCents: number;
  type: EntryType;
  kind: RecurrenceKind;
  totalCents?: number | null;
  ownerId: string;
  months: number[]; // active YYYYMM months
};

export type RecurrenceRepository = {
  list(): Promise<Recurrence[]>;
  create(input: RecurrenceInput): Promise<Recurrence>;
  update(id: string, patch: RecurrenceInput): Promise<Recurrence>;
  delete(id: string): Promise<void>;
};
