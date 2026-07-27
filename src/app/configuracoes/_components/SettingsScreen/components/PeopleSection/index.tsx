"use client";

import { Plus, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Modal } from "@/components/Modal";
import { SectionCard } from "@/components/SectionCard";
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
      <Button
        variant="dashed"
        className={styles.add}
        onClick={() => open("add")}
      >
        <Plus size={16} aria-hidden />
        Adicionar pessoa
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
