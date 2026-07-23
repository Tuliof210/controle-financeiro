"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { SectionCard } from "../SectionCard";
import { PersonForm } from "./components/PersonForm";
import { PersonRow } from "./components/PersonRow";
import { usePeopleSection } from "./hook";
import styles from "./style.module.scss";

export function PeopleSection() {
  const {
    people,
    error,
    modal,
    target,
    open,
    close,
    onAdd,
    onUpdate,
    onConfirmDelete,
  } = usePeopleSection();

  return (
    <SectionCard title="Pessoas" icon={Users}>
      {people?.length === 0 ? (
        <p className={styles.empty}>Nenhuma pessoa cadastrada ainda.</p>
      ) : (
        <ul className={styles.list}>
          {people?.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              onEdit={() => open("edit", person)}
              onDelete={() => open("delete", person)}
            />
          ))}
        </ul>
      )}
      <Button onClick={() => open("add")}>Adicionar</Button>

      <Modal open={modal === "add"} onClose={close} title="Adicionar pessoa">
        {modal === "add" && (
          <PersonForm error={error} onSubmit={onAdd} submitLabel="Adicionar" />
        )}
      </Modal>

      <Modal open={modal === "edit"} onClose={close} title="Editar pessoa">
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
        title="Excluir pessoa"
        message={`Excluir ${target?.name}? Esta ação não pode ser desfeita.`}
      />
    </SectionCard>
  );
}
