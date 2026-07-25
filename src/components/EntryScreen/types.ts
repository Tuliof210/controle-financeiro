import type { ComponentType, ReactNode } from "react";
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

export type EntryScreenLabels = {
  heading: string;
  addTitle: string;
  editTitle: string;
  deleteTitle: string;
  empty: string;
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
