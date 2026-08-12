"use client";

import { Plus, Target } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { ConfirmDialog } from "@/components/ConfirmDialog/index.tsx";
import { Modal } from "@/components/Modal/index.tsx";
import { RowGrid } from "@/components/RowGrid/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { GoalForm } from "./components/GoalForm/index.tsx";
import { GoalRow } from "./components/GoalRow/index.tsx";
import { deleteTitle } from "./goals-copy.helper.ts";
import { useGoalsSection } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  nenhumObjetivoCadastradoAinda: "Nenhum objetivo cadastrado ainda.",
  adicionarObjetivo: "Adicionar objetivo",
} as const;

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

  const noGoals = goals?.length === 0;

  return (
    <SectionCard title="Objetivos" icon={Target}>
      {noGoals && (
        <p className={styles.empty}>{COPY.nenhumObjetivoCadastradoAinda}</p>
      )}
      {!noGoals && (
        <RowGrid>
          {goals?.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </RowGrid>
      )}
      <Button variant="dashed" onClick={openAdd}>
        <Plus size={16} aria-hidden={true} />
        {COPY.adicionarObjetivo}
      </Button>

      <Modal
        open={modal.type === "add"}
        onClose={close}
        eyebrow="OBJETIVO"
        title="Adicionar objetivo"
      >
        {modal.type === "add" && (
          <GoalForm submitLabel="Adicionar" error={error} onSubmit={onAdd} />
        )}
      </Modal>

      <Modal
        open={modal.type === "edit"}
        onClose={close}
        eyebrow="OBJETIVO"
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
        error={error}
        title="Excluir objetivo"
        message={deleteTitle(modal)}
      />
    </SectionCard>
  );
}
