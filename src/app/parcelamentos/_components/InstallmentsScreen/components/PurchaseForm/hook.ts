import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { formatMoney } from "@/lib/money";
import { currentYYYYMM } from "@/lib/months";
import { resolveOwnerId } from "@/lib/ownership";
import {
  type PurchaseFormValues,
  parcelCents,
  toFormValues,
} from "../../purchase-payload.helper";

// ponytail: 2..24 covers what a card actually offers. A longer commitment is a
// financing, which is a fixed recurrence — grow this list if that stops being
// true, it costs nothing.
const PARCEL_OPTIONS = Array.from({ length: 23 }, (_, i) => String(i + 2));

export type PurchaseFormProps = {
  initial?: Recurrence;
  people: Person[];
  error?: string;
  submitLabel: string;
  onSubmit: (values: PurchaseFormValues) => void;
};

export function usePurchaseForm({
  initial,
  people,
  error,
  submitLabel,
  onSubmit,
}: PurchaseFormProps) {
  const { profile } = useProfile();
  const seed = initial ? toFormValues(initial) : undefined;
  const [name, setName] = useState(seed?.name ?? "");
  const [totalCents, setTotalCents] = useState(seed?.totalCents ?? 0);
  const [parcels, setParcels] = useState(seed?.parcels ?? 2);
  // Seeded non-null on purpose: MonthPicker fires onChange from a mount effect
  // when handed null, which is indistinguishable from the owner picking a month.
  const [firstMonth, setFirstMonth] = useState(
    seed?.firstMonth ?? currentYYYYMM(),
  );
  const [ownerId, setOwnerId] = useState(
    seed?.ownerId ?? resolveOwnerId(profile, people),
  );
  const [localError, setLocalError] = useState<string>();

  // The route rejects valueCents < 1, so a total below the parcel count would
  // come back as a generic "Dados inválidos". Caught here instead.
  const canSubmit =
    name.trim() !== "" && ownerId !== "" && totalCents >= parcels;

  return {
    name,
    setName,
    totalCents,
    setTotalCents,
    parcels,
    setParcels,
    firstMonth,
    setFirstMonth,
    ownerId,
    setOwnerId,
    people,
    parcelOptions: PARCEL_OPTIONS,
    preview:
      totalCents > 0
        ? `${parcels}x de ${formatMoney(parcelCents(totalCents, parcels))}`
        : null,
    canSubmit,
    submitLabel,
    // The server's message wins: it is the one the owner has not seen yet.
    error: error ?? localError,
    handleSubmit: () => {
      if (!canSubmit) {
        return setLocalError(
          "Preencha nome, responsável e um total de pelo menos R$ 0,01 por parcela",
        );
      }
      setLocalError(undefined);
      onSubmit({ name, totalCents, parcels, firstMonth, ownerId });
    },
  };
}
