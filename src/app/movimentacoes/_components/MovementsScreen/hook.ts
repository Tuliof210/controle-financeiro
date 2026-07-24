import { useCallback, useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Movement } from "@/core/entities/movement.entity";
import type { Person } from "@/core/entities/person.entity";
import type { Settings } from "@/core/entities/settings.entity";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { splitByType, visibleFor } from "@/lib/ownership";
import type { MovementFormValues } from "./components/MovementForm/hook";

type ModalState =
  | { type: "none" }
  | { type: "add"; kind: Movement["type"] }
  | { type: "edit"; movement: Movement }
  | { type: "delete"; movement: Movement };

export function useMovementsScreen() {
  const { profile } = useProfile();
  const [movements, setMovements] = useState<Movement[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () =>
      apiGet<Movement[]>("/api/movements").then((result) => {
        if (result.error) return setError(result.error);
        setMovements(result.data ?? []);
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

  const { income, expense } = splitByType(visibleFor(movements, profile));

  const openModal = (state: ModalState) => {
    setError(undefined);
    setModal(state);
  };
  const close = () => openModal({ type: "none" });
  const openAdd = (kind: Movement["type"]) => openModal({ type: "add", kind });
  const openEdit = (movement: Movement) =>
    openModal({ type: "edit", movement });
  const openDelete = (movement: Movement) =>
    openModal({ type: "delete", movement });

  const persist = async (result: Awaited<ReturnType<typeof apiPost>>) => {
    if (result.error) return setError(result.error);
    close();
    refetch();
  };

  const onAdd = (values: MovementFormValues) =>
    apiPost("/api/movements", values).then(persist);

  const onUpdate = (values: MovementFormValues) =>
    modal.type === "edit"
      ? apiPut("/api/movements", { id: modal.movement.id, ...values }).then(
          persist,
        )
      : undefined;

  const onConfirmDelete = () =>
    modal.type === "delete"
      ? apiDelete(`/api/movements?id=${modal.movement.id}`).then(persist)
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
