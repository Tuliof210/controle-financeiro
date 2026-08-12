import type { ComponentType, ReactNode } from "react";
import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";

export type ModalState<T> =
  | { type: "none" }
  | { type: "add"; kind: EntryType }
  | { type: "edit"; entry: T }
  | { type: "delete"; entry: T };

// The prop contract a feature form must satisfy to slot into EntryScreen —
// distinct from EntryForm's own props, which are the shared layout component's.
// `initial` accepts a bare `{ type }` seed so the add modal needs no cast: V
// always carries a `type`, but TS cannot see that through the generic on its own.
export interface EntryFormSlotProps<V> {
  initial?: Partial<V> | { type: EntryType };
  error?: string;
  submitLabel: string;
  onSubmit: (values: V) => void;
  people: Person[];
}

// Per-section copy. The two sections of one screen say different things when
// empty, so a single shared `empty` string could not carry it.
export interface EntrySectionLabels {
  add: string;
  emptyTitle: string;
  emptyHint: string;
}

export interface EntryScreenLabels {
  // One object rather than three flat fields: it spreads straight into
  // <PageHeader> and keeps EntryScreen/index.tsx at its current line count,
  // which sits right on the 100-line cap.
  header: PageHeaderProps;
  addTitle: string;
  editTitle: string;
  deleteTitle: string;
  income: EntrySectionLabels;
  expense: EntrySectionLabels;
}

export interface EntryScreenConfig<
  T extends Entry,
  V extends { type: EntryType },
> {
  // The /api/<resource> segment, e.g. "forecasts".
  resource: string;
  labels: EntryScreenLabels;
  // The global projection range is passed alongside the item so a period cell
  // can draw itself relative to it (the forecast coverage bar). Callers that
  // do not need it — Movimentações — just ignore the second argument.
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  // The band under the row, when the entity has one. A second slot rather than
  // one that returns both halves: they land in different grid areas, and
  // Movimentações has no band at all, so it simply never passes this.
  renderBand?: (item: T, period: Period | null) => ReactNode;
  form: ComponentType<EntryFormSlotProps<V>>;
}
