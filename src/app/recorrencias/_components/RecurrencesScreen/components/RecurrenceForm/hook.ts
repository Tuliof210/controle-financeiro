import { useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { buildMonths } from "./components/MonthRangeSlider/months.helper";

export type RecurrenceFormValues = {
  name: string;
  valueCents: number;
  type: Recurrence["type"];
  ownerId: string;
  rangeStart: number;
  rangeEnd: number;
};

export type RecurrenceFormProps = {
  initial?: Partial<RecurrenceFormValues>;
  error?: string;
  submitLabel: string;
  onSubmit: (values: RecurrenceFormValues) => void;
  people: Person[];
  period: { start: number; end: number } | null;
};

export function useRecurrenceForm({
  initial,
  people,
  period,
  onSubmit,
}: Pick<RecurrenceFormProps, "initial" | "people" | "period" | "onSubmit">) {
  const { profile } = useProfile();
  const defaultOwnerId = people.some((person) => person.id === profile)
    ? profile
    : (people[0]?.id ?? "");

  const [name, setName] = useState(initial?.name ?? "");
  const [valueCents, setValueCents] = useState(initial?.valueCents ?? 0);
  const [type, setType] = useState<Recurrence["type"]>(
    initial?.type ?? "income",
  );
  const [ownerId, setOwnerId] = useState(initial?.ownerId ?? defaultOwnerId);
  const [rangeStart, setRangeStart] = useState(
    initial?.rangeStart ?? period?.start ?? 0,
  );
  const [rangeEnd, setRangeEnd] = useState(
    initial?.rangeEnd ?? period?.end ?? 0,
  );
  const [localError, setLocalError] = useState<string>();

  const months = period ? buildMonths(period.start, period.end) : [];
  const onRangeChange = (next: { rangeStart: number; rangeEnd: number }) => {
    setRangeStart(next.rangeStart);
    setRangeEnd(next.rangeEnd);
  };

  const canSubmit =
    period !== null &&
    name.trim().length > 0 &&
    valueCents >= 1 &&
    ownerId !== "" &&
    rangeStart <= rangeEnd;

  const handleSubmit = () => {
    if (!canSubmit) {
      setLocalError("Preencha nome, valor e responsável corretamente");
      return;
    }
    setLocalError(undefined);
    onSubmit({
      name: name.trim(),
      valueCents,
      type,
      ownerId,
      rangeStart,
      rangeEnd,
    });
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
    months,
    rangeStart,
    rangeEnd,
    onRangeChange,
    localError,
    canSubmit,
    handleSubmit,
  };
}
