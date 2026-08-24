import { useState } from "react";
import { apiDelete, apiPost, apiPut } from "@/lib/api.ts";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import { persistWithDelta } from "./persist.helper.ts";
import type { ModalState } from "./types.ts";

interface PersistArgs<T extends Entry> {
  path: string;
  owner: string;
  modal: ModalState<T>;
  close: () => void;
  refetch: () => void;
  setError: (error: string | undefined) => void;
}

export function usePersistEntry<
  T extends Entry,
  V extends { type: EntryType },
>({ path, owner, modal, close, refetch, setError }: PersistArgs<T>) {
  const [ceilingNotice, setCeilingNotice] = useState<string>();

  const persist = async (write: () => ReturnType<typeof apiPost>) => {
    const measured = await persistWithDelta(owner, write);
    if (measured.error) {
      setError(measured.error);
      return;
    }
    close();
    refetch();
    setCeilingNotice(measured.notice);
  };

  const onAdd = (values: V) => persist(() => apiPost(path, values));

  const onUpdate = (values: V) => {
    if (modal.type === "edit") {
      persist(() => apiPut(path, { id: modal.entry.id, ...values }));
    }
  };

  const onConfirmDelete = () => {
    if (modal.type === "delete") {
      persist(() => apiDelete(`${path}?id=${modal.entry.id}`));
    }
  };

  return { ceilingNotice, onAdd, onUpdate, onConfirmDelete };
}
