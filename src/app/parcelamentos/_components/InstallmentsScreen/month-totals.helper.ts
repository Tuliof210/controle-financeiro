import type { Recurrence } from "@/core/entities/recurrence.entity";

export type MonthTotal = {
  month: number;
  totalCents: number;
  purchases: number;
};

// The same "sum recurrences per active month" the dashboard's series does, with
// two deliberate differences: nothing seeds the map, so a month only exists
// once a parcel lands in it, and no range clamps it, so a parcel past the end
// of the projection still gets a row.
//
// Sums valueCents, never totalCents: what a month owes is that month's parcel.
export function monthTotals(purchases: Recurrence[]): MonthTotal[] {
  const byMonth = new Map<number, MonthTotal>();

  for (const purchase of purchases) {
    for (const month of purchase.months) {
      const found = byMonth.get(month) ?? {
        month,
        totalCents: 0,
        purchases: 0,
      };
      found.totalCents += purchase.valueCents;
      found.purchases += 1;
      byMonth.set(month, found);
    }
  }

  // Sorted explicitly: /api/recurrences only promises createdAt order, and
  // YYYYMM sorts correctly as an integer — which is why the format exists.
  return [...byMonth.values()].sort((a, b) => a.month - b.month);
}
