import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Movement } from "@/core/entities/movement.entity";
import type { Person } from "@/core/entities/person.entity";
import { buildMonths, currentYYYYMM } from "@/lib/months";
import { resolveOwnerId } from "@/lib/ownership";

export type MovementFormValues = {
  name: string;
  valueCents: number;
  type: Movement["type"];
  ownerId: string;
  month: number;
};

export type MovementFormProps = {
  initial?: Partial<MovementFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: MovementFormValues) => void;
  people: Person[];
  period: { start: number; end: number } | null;
};

export function useMovementForm({
  initial,
  people,
  period,
  onSubmit,
}: Pick<MovementFormProps, "initial" | "people" | "period" | "onSubmit">) {
  const { profile } = useProfile();
  const defaultOwnerId = resolveOwnerId(profile, people);

  // Default to the current month, clamped into the period (YYYYMM is monotonic
  // as an int, so min/max clamps correctly); 0 when there is no period.
  const defaultMonth = period
    ? Math.min(Math.max(currentYYYYMM(), period.start), period.end)
    : 0;

  const [name, setName] = useState(initial?.name ?? "");
  const [valueCents, setValueCents] = useState(initial?.valueCents ?? 0);
  const [type, setType] = useState<Movement["type"]>(initial?.type ?? "income");
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? defaultOwnerId);
  const [month, setMonth] = useState(initial?.month ?? defaultMonth);
  const [localError, setLocalError] = useState<string>();

  const monthOptions = period ? buildMonths(period.start, period.end) : [];

  const canSubmit =
    period !== null &&
    name.trim().length > 0 &&
    valueCents >= 1 &&
    ownerId !== "" &&
    monthOptions.includes(month);

  const handleSubmit = () => {
    if (!canSubmit) {
      setLocalError("Preencha nome, valor e responsável corretamente");
      return;
    }
    setLocalError(undefined);
    onSubmit({ name: name.trim(), valueCents, type, ownerId, month });
  };

  return {
    name,
    setName,
    valueCents,
    setValueCents,
    type,
    setType,
    ownerId,
    setOwnerId,
    month,
    setMonth,
    monthOptions,
    localError,
    canSubmit,
    handleSubmit,
  };
}
