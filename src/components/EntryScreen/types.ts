import type { ComponentType, ReactNode } from "react";
import type { PageHeaderProps } from "@/components/PageHeader/hook";
import type { Person } from "@/core/entities/person.entity";
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
  period: { start: number; end: number } | null;
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
  renderPeriod: (item: T) => ReactNode;
  Form: ComponentType<EntryFormSlotProps<V>>;
};
