import type { ComponentType, ReactNode } from "react";
import type { PageHeaderProps } from "@/components/PageHeader/hook";
import type { Person } from "@/core/entities/person.entity";
import type { Period } from "@/core/use-cases/period.service";
import type { Entry, EntryType } from "@/lib/entry-types";

export type ModalState<T> =
  | { type: "none" }
  | { type: "add"; kind: EntryType }
  | { type: "edit"; entry: T }
  | { type: "delete"; entry: T };

// The prop contract a feature form must satisfy to slot into EntryScreen —
// distinct from EntryForm's own props, which are the shared layout component's.
// `initial` accepts a bare `{ type }` seed so the add modal needs no cast: V
// always carries a `type`, but TS cannot see that through the generic on its own.
export type EntryFormSlotProps<V> = {
  initial?: Partial<V> | { type: EntryType };
  error?: string;
  submitLabel: string;
  onSubmit: (values: V) => void;
  people: Person[];
};

// Per-section copy. The two sections of one screen say different things when
// empty, so a single shared `empty` string could not carry it.
export type EntrySectionLabels = {
  add: string;
  emptyTitle: string;
  emptyHint: string;
};

export type EntryScreenLabels = {
  // One object rather than three flat fields: it spreads straight into
  // <PageHeader> and keeps EntryScreen/index.tsx at its current line count,
  // which sits right on the 100-line cap.
  header: PageHeaderProps;
  addTitle: string;
  editTitle: string;
  deleteTitle: string;
  income: EntrySectionLabels;
  expense: EntrySectionLabels;
};

export type EntryScreenConfig<
  T extends Entry,
  V extends { type: EntryType },
> = {
  // The /api/<resource> segment, e.g. "recurrences".
  resource: string;
  labels: EntryScreenLabels;
  // Narrows what this screen shows, on the client, after fetching everything.
  // It has to be here and not in the query string: `resource` is also the base
  // of the delete URL, and it is the same repository call that feeds the
  // dashboard and the derived period — filtering server-side would silently
  // move numbers on screens this one knows nothing about.
  visible?: (item: T) => boolean;
  // The global projection range is passed alongside the item so a period cell
  // can draw itself relative to it (the recurrence coverage bar). Callers that
  // do not need it — Movimentações — just ignore the second argument.
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  // The band under the row, when the entity has one. A second slot rather than
  // one that returns both halves: they land in different grid areas, and
  // Movimentações has no band at all, so it simply never passes this.
  renderBand?: (item: T, period: Period | null) => ReactNode;
  Form: ComponentType<EntryFormSlotProps<V>>;
};
