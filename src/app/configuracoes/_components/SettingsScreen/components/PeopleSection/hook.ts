import { useCallback, useEffect, useState } from "react";
import type { Person } from "@/core/entities/person.entity.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";
import type { PersonDraft } from "./components/PersonForm/hook.ts";

type ModalKind = "none" | "add" | "edit" | "delete";

export function usePeopleSection() {
  const [people, setPeople] = useState<Person[] | null>(null);
  const [error, setError] = useState<string>();
  const [modal, setModal] = useState<ModalKind>("none");
  const [target, setTarget] = useState<Person>();

  const refetch = useCallback(
    () =>
      apiGet<Person[]>("/api/people").then((result) => {
        if (result.error) {
          setError(result.error);
          return;
        }
        setPeople(result.data ?? []);
      }),
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const open = (kind: ModalKind, person?: Person) => {
    setError(undefined);
    setTarget(person);
    setModal(kind);
  };
  const close = () => {
    setModal("none");
    setError(undefined);
  };

  const onAdd = async (draft: PersonDraft) => {
    const result = await apiPost("/api/people", draft);
    if (result.error) return setError(result.error);
    close();
    refetch();
  };

  const onUpdate = async (draft: PersonDraft) => {
    if (!target) return;
    const result = await apiPut("/api/people", { id: target.id, ...draft });
    if (result.error) return setError(result.error);
    close();
    refetch();
  };

  const onConfirmDelete = async () => {
    if (!target) return;
    const result = await apiDelete(`/api/people?id=${target.id}`);
    if (result.error) return setError(result.error);
    close();
    refetch();
  };

  return {
    people,
    error,
    modal,
    target,
    open,
    close,
    onAdd,
    onUpdate,
    onConfirmDelete,
  };
}
