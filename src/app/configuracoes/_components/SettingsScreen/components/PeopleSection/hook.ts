import { useCallback, useEffect, useState } from "react";
import type { Person } from "@/core/entities/person.entity";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { PALETTE } from "@/lib/palette";

export function usePeopleSection() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () =>
      apiGet<Person[]>("/api/people").then(({ data }) => setPeople(data ?? [])),
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onAdd = async () => {
    const result = await apiPost("/api/people", { name, color });
    if (result.error) {
      setError(result.error);
      return;
    }
    setName("");
    setColor(PALETTE[0]);
    setError(undefined);
    refetch();
  };

  const onDelete = async (id: string) => {
    const result = await apiDelete(`/api/people?id=${id}`);
    if (result.error) {
      setError(result.error);
      return;
    }
    refetch();
  };

  return { people, name, setName, color, setColor, error, onAdd, onDelete };
}
