import type { EntryType } from "@/lib/entry-types";

// Lives with the entity rather than in entry-types.ts because it is
// recurrence-only: a movement has no kind. "fixed" is the stable stuff —
// salary, rent, financing. "installment" is one purchase split over N
// consecutive months.
export const RECURRENCE_KINDS = ["fixed", "installment"] as const;
export type RecurrenceKind = (typeof RECURRENCE_KINDS)[number];

export type Recurrence = {
  id: string;
  name: string;
  valueCents: number;
  type: EntryType;
  kind: RecurrenceKind;
  totalCents: number | null; // installments only, and display-only
  ownerId: string;
  months: number[]; // sorted, de-duped YYYYMM list of active months
  createdAt: Date;
};
