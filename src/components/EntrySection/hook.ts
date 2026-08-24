import type { ReactNode } from "react";
import type { EntrySectionLabels } from "@/components/EntryScreen/types.ts";
import type { MvIconName } from "@/components/Icon/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import type { Entry } from "@/lib/entry-types.ts";
import { formatMoney } from "@/lib/money.ts";

export interface EntrySectionProps<T extends Entry> {
  title: string;
  icon: MvIconName;
  // Only the inflow section is tinted; expense passes nothing.
  tone?: "positive";
  items: T[];
  people: Person[];
  period: Period | null;
  labels: EntrySectionLabels;
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  renderBadges?: (item: T, period: Period | null) => ReactNode;
  renderBand?: (item: T, period: Period | null) => ReactNode;
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

// Resolves each row's owner and period once here, so EntryRow never refetches or
// re-searches the people list itself.
export function useEntrySection<T extends Entry>({
  title,
  icon,
  tone,
  items,
  people,
  period,
  labels,
  renderPeriod,
  renderBadges,
  renderBand,
  onAdd,
  onEdit,
  onDelete,
}: EntrySectionProps<T>) {
  const rows = items.map((item) => ({
    entry: item,
    person: people.find((person) => person.id === item.ownerId),
    period: renderPeriod(item, period),
    badges: renderBadges?.(item, period),
    band: renderBand?.(item, period),
    onEdit: () => onEdit(item),
    onDelete: () => onDelete(item),
  }));

  // `items` arrives already filtered by the person <select> (visibleFor), so the
  // header total always agrees with the rows rendered under it.
  const totalCents = items.reduce((sum, item) => sum + item.valueCents, 0);

  return {
    title,
    icon,
    tone,
    rows,
    total: formatMoney(totalCents),
    labels,
    onAdd,
  };
}
