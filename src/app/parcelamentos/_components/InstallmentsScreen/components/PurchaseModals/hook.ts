import type { Person } from "@/core/entities/person.entity";
import type { PurchaseModal } from "../../hook";
import type { PurchaseFormValues } from "../../purchase-payload.helper";

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
