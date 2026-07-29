import type { Person } from "@/core/entities/person.entity";
import type { PurchaseFormValues } from "../../purchase-payload.helper";
import type { PurchaseModal } from "../../types";

export type PurchaseModalsProps = {
  modal: PurchaseModal;
  people: Person[];
  error?: string;
  close: () => void;
  onAdd: (values: PurchaseFormValues) => void;
  onUpdate: (values: PurchaseFormValues) => void;
  onConfirmDelete: () => void;
};

export function usePurchaseModals(props: PurchaseModalsProps) {
  return props;
}
