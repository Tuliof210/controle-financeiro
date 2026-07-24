"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { RecurrenceForm } from "./components/RecurrenceForm";
import { RecurrenceSection } from "./components/RecurrenceSection";
import { useRecurrencesScreen } from "./hook";
import styles from "./style.module.scss";

export function RecurrencesScreen() {
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
  } = useRecurrencesScreen();

  return (
    <div className={styles.screen}>
      <h1 className={styles.eyebrow}>Recorrências</h1>

      <div className={styles.grid}>
        <RecurrenceSection
          title="Entradas"
          icon={ArrowDownCircle}
          items={income}
          people={people}
          onAdd={() => openAdd("income")}
          onEdit={openEdit}
          onDelete={openDelete}
        />
        <RecurrenceSection
          title="Saídas"
          icon={ArrowUpCircle}
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
        title="Adicionar recorrência"
      >
        {modal.type === "add" && (
          <RecurrenceForm
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
        title="Editar recorrência"
      >
        {modal.type === "edit" && (
          <RecurrenceForm
            initial={modal.recurrence}
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
        title="Excluir recorrência"
        message={
          modal.type === "delete" ? `Excluir "${modal.recurrence.name}"?` : ""
        }
      />
    </div>
  );
}
