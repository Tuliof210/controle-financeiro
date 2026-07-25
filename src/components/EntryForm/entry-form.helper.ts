import type { EntryType } from "@/lib/entry-types";

// The half of an entry that never varies between entities. The period — the
// half that does — stays in each feature's own form hook, so no generic is
// needed here and each form keeps its own concrete payload type.
export type EntryFormBase = {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
};

// Shared by both features, so a regression here breaks recurrences and
// movements together — hence the colocated tests.
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
