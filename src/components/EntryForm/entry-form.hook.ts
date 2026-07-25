import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { EntryType } from "@/lib/entry-types";
import { resolveOwnerId } from "@/lib/ownership";
import {
  type EntryFormBase,
  isEntryValid,
  toEntryBase,
} from "./entry-form.helper";

// Role-suffixed rather than a plain `hook.ts`: this is consumed by each
// feature's own form hook, not by EntryForm/index.tsx, which is presentational.
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
    base: () => toEntryBase({ name, valueCents, type, ownerId }),
    isValid: isEntryValid({ name, valueCents, ownerId }),
    localError,
    setLocalError,
  };
}
