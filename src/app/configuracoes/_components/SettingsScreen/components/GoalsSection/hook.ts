import { useCallback, useEffect, useState } from "react";
import type { Goal } from "@/core/entities/goal.entity";
import { apiDelete, apiGet, apiPost } from "@/lib/api";

export function useGoalsSection() {
  const [goals, setGoals] = useState<Goal[] | null>(null);
  const [name, setName] = useState("");
  const [targetCents, setTargetCents] = useState(0);
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () => apiGet<Goal[]>("/api/goals").then(({ data }) => setGoals(data ?? [])),
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onAdd = async () => {
    if (targetCents < 1) {
      setError("Informe um valor maior que zero");
      return;
    }
    const result = await apiPost("/api/goals", { name, targetCents });
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setTargetCents(0);
    setError(undefined);
    refetch();
  };

  const onDelete = async (id: string) => {
    await apiDelete(`/api/goals?id=${id}`);
    refetch();
  };

  return {
    goals,
    name,
    setName,
    targetCents,
    setTargetCents,
    error,
    onAdd,
    onDelete,
  };
}
