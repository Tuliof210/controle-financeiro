import type { Recurrence } from "@/core/entities/recurrence.entity";
import { addMonths, buildMonths } from "@/lib/months";

export type PurchaseFormValues = {
  name: string;
  totalCents: number;
  parcels: number;
  firstMonth: number;
  ownerId: string;
};

// Rounds UP, unlike every other money figure in this codebase: a spending
// allowance rounds down so it is never overspent (see ceiling.helper.ts), but a
// debt rounds up so the projection is never short. The residue — under one cent
// per parcel — is deliberate and never reconciled: the projection reads
// valueCents per month and totalCents is only ever displayed.
export function parcelCents(totalCents: number, parcels: number): number {
  return Math.ceil(totalCents / parcels);
}

// The months are always contiguous, which is what lets months.length BE the
// parcel count. Nothing on this screen can write a gap; if that ever changes,
// toFormValues below starts lying.
export function toRecurrencePayload({
  name,
  totalCents,
  parcels,
  firstMonth,
  ownerId,
}: PurchaseFormValues) {
  return {
    name: name.trim(),
    valueCents: parcelCents(totalCents, parcels),
    type: "expense" as const,
    kind: "installment" as const,
    totalCents,
    ownerId,
    months: buildMonths(firstMonth, addMonths(firstMonth, parcels - 1)),
  };
}

export function toFormValues(purchase: Recurrence): PurchaseFormValues {
  return {
    name: purchase.name,
    totalCents:
      purchase.totalCents ?? purchase.valueCents * purchase.months.length,
    parcels: purchase.months.length,
    firstMonth: purchase.months[0],
    ownerId: purchase.ownerId,
  };
}
