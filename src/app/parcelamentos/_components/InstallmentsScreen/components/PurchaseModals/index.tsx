import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { PurchaseForm } from "../PurchaseForm";
import { type PurchaseModalsProps, usePurchaseModals } from "./hook";

export function PurchaseModals(props: PurchaseModalsProps) {
  const { modal, people, error, close, onAdd, onUpdate, onConfirmDelete } =
    usePurchaseModals(props);

  return (
    <>
      <Modal
        open={modal.type === "add"}
        onClose={close}
        title="Nova compra parcelada"
      >
        {modal.type === "add" && (
          <PurchaseForm
            people={people}
            error={error}
            submitLabel="Adicionar"
            onSubmit={onAdd}
          />
        )}
      </Modal>

      <Modal
        open={modal.type === "edit"}
        onClose={close}
        title="Editar compra parcelada"
      >
        {modal.type === "edit" && (
          <PurchaseForm
            initial={modal.purchase}
            people={people}
            error={error}
            submitLabel="Salvar"
            onSubmit={onUpdate}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal.type === "delete"}
        onClose={close}
        onConfirm={onConfirmDelete}
        title="Excluir compra parcelada"
        message={
          modal.type === "delete"
            ? `"${modal.purchase.name}" sai da projeção de todos os meses que ainda deve.`
            : ""
        }
        error={error}
      />
    </>
  );
}
