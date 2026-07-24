"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { MovementForm } from "./components/MovementForm";
import { MovementSection } from "./components/MovementSection";
import { useMovementsScreen } from "./hook";
import styles from "./style.module.scss";

export function MovementsScreen() {
  const {
    income,
    expense,
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
  } = useMovementsScreen();

  return (
    <div className={styles.screen}>
      <h1 className={styles.eyebrow}>Movimentações</h1>

      <div className={styles.grid}>
        <MovementSection
          title="Entradas"
          icon={ArrowDownCircle}
          tone="positive"
          items={income}
          people={people}
          onAdd={() => openAdd("income")}
          onEdit={openEdit}
          onDelete={openDelete}
        />
        <MovementSection
          title="Saídas"
          icon={ArrowUpCircle}
          tone="negative"
          items={expense}
          people={people}
          onAdd={() => openAdd("expense")}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>

      <Modal
        open={modal.type === "add"}
        onClose={close}
        title="Adicionar movimentação"
      >
        {modal.type === "add" && (
          <MovementForm
            initial={{ type: modal.kind }}
            error={error}
            onSubmit={onAdd}
            submitLabel="Adicionar"
            people={people}
            period={period}
          />
        )}
      </Modal>

      <Modal
        open={modal.type === "edit"}
        onClose={close}
        title="Editar movimentação"
      >
        {modal.type === "edit" && (
          <MovementForm
            initial={modal.movement}
            error={error}
            onSubmit={onUpdate}
            submitLabel="Salvar"
            people={people}
            period={period}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal.type === "delete"}
        onClose={close}
        onConfirm={onConfirmDelete}
        title="Excluir movimentação"
        message={
          modal.type === "delete" ? `Excluir "${modal.movement.name}"?` : ""
        }
      />
    </div>
  );
}
