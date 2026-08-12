import type { ReactNode } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import type { EntryType } from "@/lib/entry-types.ts";

// The half of an entry that never varies between entities. The period — the
// half that does — stays in each feature's own form hook, so no generic is
// needed here and each form keeps its own concrete payload type.
export interface EntryFormBase {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
}

// Shared by both features, so a regression here breaks forecasts and
// movements together.
export function isEntryValid({
  name,
  valueCents,
  ownerId,
}: Pick<EntryFormBase, "name" | "valueCents" | "ownerId">): boolean {
  return name.trim().length > 0 && valueCents >= 1 && ownerId !== "";
}

// The shared half of the submit payload, trimmed and ready.
export function toEntryBase({
  name,
  valueCents,
  type,
  ownerId,
}: EntryFormBase): EntryFormBase {
  return { name: name.trim(), valueCents, type, ownerId };
}

export type EntryFormFields = EntryFormBase & {
  setName: (value: string) => void;
  setValueCents: (value: number) => void;
  setType: (value: EntryFormBase["type"]) => void;
  setOwnerId: (value: string) => void;
};

export interface EntryFormProps {
  // Prefixes the field ids, e.g. "forecast" -> "forecast-name".
  idPrefix: string;
  people: Person[];
  fields: EntryFormFields;
  // The entity's own month control — a MonthPicker (Movement) or an
  // IntervalList (Forecast) — the one part of the form that genuinely
  // differs, so the caller renders it. Always non-null: there is no global
  // period to wait on any more, every month in the domain is fair game.
  period: ReactNode;
  error?: string;
  submitLabel: string;
  canSubmit: boolean;
  onSubmit: () => void;
}
