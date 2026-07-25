import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { EntryType } from "@/lib/entry-types";
import { resolveOwnerId } from "@/lib/ownership";

// The half of an entry that never varies between entities. The period — the
// half that does — stays in each feature's own form hook, so no generic is
// needed here and each form keeps its own concrete payload type.
export type EntryFormBase = {
  name: string;
  valueCents: number;
  type: EntryType;
  ownerId: string;
};

export function useEntryForm(
  initial: Partial<EntryFormBase> | undefined,
  people: Person[],
) {
  const { profile } = useProfile();
  const [name, setName] = useState(initial?.name ?? "");
  const [valueCents, setValueCents] = useState(initial?.valueCents ?? 0);
  const [type, setType] = useState<EntryType>(initial?.type ?? "income");
  const [ownerId, setOwnerId] = useState(
    initial?.ownerId ?? resolveOwnerId(profile, people),
  );
  const [localError, setLocalError] = useState<string>();

  return {
    // Spread straight into <EntryForm />.
    fields: {
      name,
      setName,
      valueCents,
      setValueCents,
      type,
      setType,
      ownerId,
      setOwnerId,
    },
    // The shared half of the submit payload, trimmed and ready.
    base: (): EntryFormBase => ({
      name: name.trim(),
      valueCents,
      type,
      ownerId,
    }),
    isValid: name.trim().length > 0 && valueCents >= 1 && ownerId !== "",
    localError,
    setLocalError,
  };
}
