"use client";

import { Pencil, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconButton } from "@/components/IconButton";
import { Modal } from "@/components/Modal";
import { formatCents } from "@/components/MoneyInput/money.helper";
import { SectionCard } from "@/components/SectionCard";
import { GoalForm } from "./components/GoalForm";
import { useGoalsSection } from "./hook";
import styles from "./style.module.scss";

export function GoalsSection() {
  const {
    goals,
    modal,
    error,
    openAdd,
    openEdit,
    openDelete,
    close,
    onAdd,
    onUpdate,
    onConfirmDelete,
  } = useGoalsSection();

  return (
    <SectionCard title="Objetivos" icon={Target}>
      {goals?.length === 0 ? (
        <p className={styles.empty}>Nenhum objetivo cadastrado ainda.</p>
      ) : (
        <ul className={styles.list}>
          {goals?.map((goal) => (
            <li key={goal.id} className={styles.row}>
              <span className={styles.name}>{goal.name}</span>
              <span className={styles.target}>
                R$ {formatCents(goal.targetCents)}
              </span>
              <span className={styles.placeholder}>— progresso em breve</span>
              <IconButton
                aria-label={`Editar ${goal.name}`}
                onClick={() => openEdit(goal)}
              >
                <Pencil size={16} />
              </IconButton>
              <IconButton
                variant="danger"
                aria-label={`Excluir ${goal.name}`}
                onClick={() => openDelete(goal)}
              >
                <Trash2 size={16} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      <Button onClick={openAdd}>Adicionar</Button>

      <Modal
        open={modal.type === "add"}
        onClose={close}
        title="Adicionar objetivo"
      >
        {modal.type === "add" && (
          <GoalForm submitLabel="Adicionar" error={error} onSubmit={onAdd} />
        )}
      </Modal>

      <Modal
        open={modal.type === "edit"}
        onClose={close}
        title="Editar objetivo"
      >
        {modal.type === "edit" && (
          <GoalForm
            submitLabel="Salvar"
            error={error}
            initial={{
              name: modal.goal.name,
              targetCents: modal.goal.targetCents,
            }}
            onSubmit={onUpdate}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal.type === "delete"}
        onClose={close}
        onConfirm={onConfirmDelete}
        title="Excluir objetivo"
        message={
          modal.type === "delete"
            ? `Excluir o objetivo "${modal.goal.name}"?`
            : ""
        }
      />
    </SectionCard>
  );
}
