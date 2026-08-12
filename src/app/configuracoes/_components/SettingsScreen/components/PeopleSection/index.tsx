"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { ConfirmDialog } from "@/components/ConfirmDialog/index.tsx";
import { Modal } from "@/components/Modal/index.tsx";
import { RowGrid } from "@/components/RowGrid/index.tsx";
import { SectionCard } from "@/components/SectionCard/index.tsx";
import { PersonForm } from "./components/PersonForm/index.tsx";
import { PersonRow } from "./components/PersonRow/index.tsx";
import { usePeopleSection } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  nenhumaPessoaCadastradaAinda: "Nenhuma pessoa cadastrada ainda.",
  adicionarPessoa: "Adicionar pessoa",
} as const;

export function PeopleSection() {
  const {
    people,
    error,
    modal,
    target,
    openAdd,
    openEdit,
    openDelete,
    close,
    onAdd,
    onUpdate,
    onConfirmDelete,
  } = usePeopleSection();

  const noPeople = people?.length === 0;

  return (
    <SectionCard title="Pessoas" icon={Users}>
      {noPeople && (
        <p className={styles.empty}>{COPY.nenhumaPessoaCadastradaAinda}</p>
      )}
      {!noPeople && (
        <RowGrid>
          {people?.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </RowGrid>
      )}
      <Button variant="dashed" onClick={openAdd}>
        <Plus size={16} aria-hidden={true} />
        {COPY.adicionarPessoa}
      </Button>

      <Modal
        open={modal === "add"}
        onClose={close}
        eyebrow="PESSOA"
        title="Adicionar pessoa"
      >
        {modal === "add" && (
          <PersonForm error={error} onSubmit={onAdd} submitLabel="Adicionar" />
        )}
      </Modal>

      <Modal
        open={modal === "edit"}
        onClose={close}
        eyebrow="PESSOA"
        title="Editar pessoa"
      >
        {modal === "edit" && target && (
          <PersonForm
            initial={{ name: target.name, color: target.color }}
            error={error}
            onSubmit={onUpdate}
            submitLabel="Salvar"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={modal === "delete"}
        onClose={close}
        onConfirm={onConfirmDelete}
        error={error}
        title="Excluir pessoa"
        message={`Excluir ${target?.name}? Esta ação não pode ser desfeita.`}
      />
    </SectionCard>
  );
}
