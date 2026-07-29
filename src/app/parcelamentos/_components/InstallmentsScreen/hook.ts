import { useCallback, useEffect, useState } from "react";
import { useProfile } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";
import type { Recurrence } from "@/core/entities/recurrence.entity";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { visibleFor } from "@/lib/ownership";
import {
  type PurchaseFormValues,
  toRecurrencePayload,
} from "./purchase-payload.helper";
import { type InstallmentsTab, type PurchaseModal, TAB_LABELS } from "./types";

const PATH = "/api/recurrences";

// One fetch of every recurrence, narrowed here: /api/recurrences is the same
// list the dashboard sums, so the split between fixed and installment is a
// client-side read, never a query parameter.
export function useInstallmentsScreen() {
  const { profile } = useProfile();
  const [items, setItems] = useState<Recurrence[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [tab, setTab] = useState<InstallmentsTab>("compras");
  const [modal, setModal] = useState<PurchaseModal>({ type: "none" });
  const [error, setError] = useState<string>();

  const refetch = useCallback(
    () =>
      apiGet<Recurrence[]>(PATH).then((result) => {
        if (result.error) return setError(result.error);
        setItems(result.data ?? []);
      }),
    [],
  );

  useEffect(() => {
    refetch();
    apiGet<Person[]>("/api/people").then((result) => {
      if (!result.error) setPeople(result.data ?? []);
    });
  }, [refetch]);

  const purchases = visibleFor(items, profile).filter(
    (item) => item.kind === "installment",
  );

  // Every modal transition goes through here, exactly as EntryScreen's does:
  // one `error` slot feeds all three dialogs, so a failure left behind by the
  // add form would otherwise greet the next one — including the delete
  // confirmation, where a stale red banner reads as "this delete was refused".
  const openModal = (state: PurchaseModal) => {
    setError(undefined);
    setModal(state);
  };

  const persist = async (result: Awaited<ReturnType<typeof apiPost>>) => {
    if (result.error) return setError(result.error);
    openModal({ type: "none" });
    refetch();
  };

  const onAdd = (values: PurchaseFormValues) =>
    apiPost(PATH, toRecurrencePayload(values)).then(persist);

  // The whole payload goes back, kind and totalCents included: PUT replaces the
  // row, so an omitted kind would quietly turn the purchase into a fixed
  // recurrence and move it to the other screen.
  const onUpdate = (values: PurchaseFormValues) =>
    modal.type === "edit"
      ? apiPut(PATH, {
          id: modal.purchase.id,
          ...toRecurrencePayload(values),
        }).then(persist)
      : undefined;

  const onConfirmDelete = () =>
    modal.type === "delete"
      ? apiDelete(`${PATH}?id=${modal.purchase.id}`).then(persist)
      : undefined;

  return {
    tab,
    tabs: TAB_LABELS.map(([id, label]) => ({ id, label, active: id === tab })),
    onSelect: setTab,
    purchases,
    people,
    modal,
    openModal,
    close: () => openModal({ type: "none" }),
    error,
    onAdd,
    onUpdate,
    onConfirmDelete,
  };
}
