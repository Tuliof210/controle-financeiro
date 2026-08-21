import { useCallback, useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook.ts";
import type { Person } from "@/core/entities/person.entity.ts";
import type { Period } from "@/core/use-cases/period.service.ts";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import { useEntryList } from "./list.hook.ts";
import type { EntryScreenConfig, ModalState } from "./types.ts";

export function useEntryScreen<T extends Entry, V extends { type: EntryType }>({
  resource,
  labels,
  list,
}: EntryScreenConfig<T, V>) {
  const { profile } = useProfile();
  const [items, setItems] = useState<T[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [period, setPeriod] = useState<Period | null>(null);
  const [modal, setModal] = useState<ModalState<T>>({ type: "none" });
  const [error, setError] = useState<string>();

  const path = `/api/${resource}`;

  const refetch = useCallback(
    () =>
      apiGet<T[]>(path).then((result) => {
        if (result.error) {
          return setError(result.error);
        }
        setItems(result.data ?? []);
      }),
    [path],
  );

  useEffect(() => {
    refetch();
    apiGet<Person[]>("/api/people").then((result) => {
      if (!result.error) {
        setPeople(result.data ?? []);
      }
    });
    apiGet<Period | null>("/api/period").then((result) => {
      if (!result.error) {
        setPeriod(result.data ?? null);
      }
    });
  }, [refetch]);

  const listed = useEntryList(items, profile, list);

  const openModal = (state: ModalState<T>) => {
    setError(undefined);
    setModal(state);
  };
  const close = () => openModal({ type: "none" });
  const openAdd = (kind: EntryType) => openModal({ type: "add", kind });
  const openEdit = (entry: T) => openModal({ type: "edit", entry });
  const openDelete = (entry: T) => openModal({ type: "delete", entry });

  const persist = (result: Awaited<ReturnType<typeof apiPost>>) => {
    if (result.error) {
      setError(result.error);
      return;
    }
    close();
    refetch();
  };

  const onAdd = (values: V) => apiPost(path, values).then(persist);

  const onUpdate = (values: V) => {
    if (modal.type === "edit") {
      apiPut(path, { id: modal.entry.id, ...values }).then(persist);
    }
  };

  const onConfirmDelete = () => {
    if (modal.type === "delete") {
      apiDelete(`${path}?id=${modal.entry.id}`).then(persist);
    }
  };

  return {
    labels,
    ...listed,
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
