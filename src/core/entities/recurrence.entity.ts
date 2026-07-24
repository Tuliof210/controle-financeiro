import type { EntryType } from "@/lib/entry-types";

export type Recurrence = {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
  months: number[]; // sorted, de-duped YYYYMM list of active months
  createdAt: Date;
};
