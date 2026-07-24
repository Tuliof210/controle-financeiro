import { useCallback, useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import type { Settings } from "@/core/entities/settings.entity";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { splitByType, visibleFor } from "@/lib/ownership";
import type { RecurrenceFormValues } from "./components/RecurrenceForm/hook";

type ModalState =
  | { type: "none" }
  | { type: "add"; kind: Recurrence["type"] }
  | { type: "edit"; recurrence: Recurrence }
  | { type: "delete"; recurrence: Recurrence };

export function useRecurrencesScreen() {
  const { profile } = useProfile();
  const [recurrences, setRecurrences] = useState<Recurrence[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () =>
      apiGet<Recurrence[]>("/api/recurrences").then((result) => {
        if (result.error) return setError(result.error);
        setRecurrences(result.data ?? []);
      }),
    [],
  );

  useEffect(() => {
    refetch();
    apiGet<Person[]>("/api/people").then((result) => {
      if (!result.error) setPeople(result.data ?? []);
    });
    apiGet<Settings>("/api/settings").then((result) => {
      if (!result.error && result.data) setSettings(result.data);
    });
  }, [refetch]);

  const { income, expense } = splitByType(visibleFor(recurrences, profile));

  const openModal = (state: ModalState) => {
    setError(undefined);
    setModal(state);
  };
  const close = () => openModal({ type: "none" });
  const openAdd = (kind: Recurrence["type"]) =>
    openModal({ type: "add", kind });
  const openEdit = (recurrence: Recurrence) =>
    openModal({ type: "edit", recurrence });
  const openDelete = (recurrence: Recurrence) =>
    openModal({ type: "delete", recurrence });

  const persist = async (result: Awaited<ReturnType<typeof apiPost>>) => {
    if (result.error) return setError(result.error);
    close();
    refetch();
  };

  const onAdd = (values: RecurrenceFormValues) =>
    apiPost("/api/recurrences", values).then(persist);

  const onUpdate = (values: RecurrenceFormValues) =>
    modal.type === "edit"
      ? apiPut("/api/recurrences", { id: modal.recurrence.id, ...values }).then(
          persist,
        )
      : undefined;

  const onConfirmDelete = () =>
    modal.type === "delete"
      ? apiDelete(`/api/recurrences?id=${modal.recurrence.id}`).then(persist)
      : undefined;

  const period =
    settings?.rangeStart != null && settings?.rangeEnd != null
      ? { start: settings.rangeStart, end: settings.rangeEnd }
      : null;

  return {
    income,
    expense,
    people,
    period,
    modal,
    error,
    openAdd,
    openEdit,
    openDelete,
    close,
    onAdd,
    onUpdate,
    onConfirmDelete,
  };
}
