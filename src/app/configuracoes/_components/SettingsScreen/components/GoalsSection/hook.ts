import { useCallback, useEffect, useState } from "react";
import type { Goal } from "@/core/entities/goal.entity.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";
import type { GoalFormValues } from "./components/GoalForm/hook.ts";

type ModalState =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; goal: Goal }
  | { type: "delete"; goal: Goal };

export function useGoalsSection() {
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () =>
      apiGet<Goal[]>("/api/goals").then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        setGoals(result.data ?? []);
      }),
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const close = () => {
    setModal({ type: "none" });
    setError(undefined);
  };
  const openAdd = () => {
    setError(undefined);
    setModal({ type: "add" });
  };
  const openEdit = (goal: Goal) => {
    setError(undefined);
    setModal({ type: "edit", goal });
  };
  // Clears like openAdd/openEdit do: the dialog now renders `error`, so a
  // stale one from a failed refetch would greet the user on open.
  const openDelete = (goal: Goal) => {
    setError(undefined);
    setModal({ type: "delete", goal });
  };

  const persist = async (result: Awaited<ReturnType<typeof apiPost>>) => {
    if (result.error) {
      setError(result.error);
      return;
    }
    close();
    refetch();
  };

  const onAdd = (values: GoalFormValues) =>
    apiPost("/api/goals", values).then(persist);

  const onUpdate = (values: GoalFormValues) => {
    if (modal.type !== "edit") {
      return;
    }
    return apiPut("/api/goals", { id: modal.goal.id, ...values }).then(persist);
  };

  const onConfirmDelete = () => {
    if (modal.type !== "delete") {
      return;
    }
    return apiDelete(`/api/goals?id=${modal.goal.id}`).then(persist);
  };

  return {
    goals,
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
