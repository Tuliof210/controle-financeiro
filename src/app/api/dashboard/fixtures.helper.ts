import type { Movement } from "@/core/entities/movement.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { EntryType } from "@/lib/entry-types";

// Entry factories shared by this folder's test suites. Not a *.test.ts file,
// so Vitest does not collect it, and no app code imports it.

export const movement = (
  month: number,
  type: EntryType,
  valueCents: number,
  ownerId = "p1",
): Movement => ({
  id: `m-${month}-${ownerId}-${type}-${valueCents}`,
  name: "m",
  valueCents,
  type,
  ownerId,
  month,
  createdAt: new Date(0),
});

export const recurrence = (
  months: number[],
  type: EntryType,
  valueCents: number,
  ownerId = "p1",
): Recurrence => ({
  id: `r-${ownerId}-${type}-${valueCents}`,
  name: "r",
  valueCents,
  type,
  ownerId,
  months,
  createdAt: new Date(0),
});
