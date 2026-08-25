"use client";

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
    <SectionCard title="Pessoas">
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
      <Button variant="dashed" onClick={openAdd} iconLeft="plus">
        {COPY.adicionarPessoa}
      </Button>

      {modal === "add" && (
        <Modal open={true} onClose={close} title="Adicionar pessoa">
          <PersonForm error={error} onSubmit={onAdd} submitLabel="Adicionar" />
        </Modal>
      )}
      {modal === "edit" && target !== undefined && (
        <Modal open={true} onClose={close} title="Editar pessoa">
          <PersonForm
            initial={{ name: target.name, color: target.color }}
            error={error}
            onSubmit={onUpdate}
            submitLabel="Salvar"
          />
        </Modal>
      )}
      {modal === "delete" && target !== undefined && (
        <ConfirmDialog
          open={true}
          onClose={close}
          onConfirm={onConfirmDelete}
          error={error}
          title="Excluir pessoa"
          message={`Excluir ${target.name}? Esta ação não pode ser desfeita.`}
        />
      )}
    </SectionCard>
  );
}
