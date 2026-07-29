import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { formatMoney } from "@/lib/money";
import { formatMonths } from "@/lib/month-intervals.helper";

export type PurchaseListProps = {
  purchases: Recurrence[];
  people: Person[];
  onAdd: () => void;
  onEdit: (purchase: Recurrence) => void;
  onDelete: (purchase: Recurrence) => void;
};

export function usePurchaseList({
  purchases,
  people,
  onAdd,
  onEdit,
  onDelete,
}: PurchaseListProps) {
  return {
    onAdd,
    rows: purchases.map((purchase) => ({
      purchase,
      person: people.find((person) => person.id === purchase.ownerId),
      // Span and parcel count ride in the period slot; the total goes in the
      // band. Not in the same line: at 375px the metadata line ellipsizes and
      // ate the total whole, while the band spans the row's full width. A
      // fifth column was never an option — RowGrid places cells by data-cell
      // alone and its stylesheet is at the file cap.
      period: `${formatMonths(purchase.months)} · ${purchase.months.length}x`,
      total: formatMoney(
        // Null only on a row written outside this screen; the product is the
        // honest fallback, since it is what the projection will actually spend.
        purchase.totalCents ?? purchase.valueCents * purchase.months.length,
      ),
      onEdit: () => onEdit(purchase),
      onDelete: () => onDelete(purchase),
    })),
  };
}
