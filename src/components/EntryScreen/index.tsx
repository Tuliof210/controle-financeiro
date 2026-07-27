"use client";

import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EntrySection } from "@/components/EntrySection";
import { Modal } from "@/components/Modal";
import { PageHeader } from "@/components/PageHeader";
import type { Entry, EntryType } from "@/lib/entry-types";
import { useEntryScreen } from "./hook";
import styles from "./style.module.scss";
import type { EntryScreenConfig } from "./types";

export function EntryScreen<T extends Entry, V extends { type: EntryType }>(
  config: EntryScreenConfig<T, V>,
) {
  const { renderPeriod, Form } = config;
  const {
    labels,
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
  } = useEntryScreen(config);

  return (
    <div className={styles.screen}>
      <PageHeader {...labels.header} />

      <div className={styles.grid}>
        <EntrySection
          title="Entradas"
          icon={ArrowDownCircle}
          tone="positive"
          items={income}
          people={people}
          period={period}
          labels={labels.income}
          renderPeriod={renderPeriod}
          onAdd={() => openAdd("income")}
          onEdit={openEdit}
          onDelete={openDelete}
        />
        <EntrySection
          title="Saídas"
          icon={ArrowUpCircle}
          tone="negative"
          items={expense}
          people={people}
          period={period}
          labels={labels.expense}
          renderPeriod={renderPeriod}
          onAdd={() => openAdd("expense")}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      </div>

      <Modal
        open={modal.type === "add"}
        onClose={close}
        title={labels.addTitle}
      >
        {modal.type === "add" && (
          <Form
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
        title={labels.editTitle}
      >
        {modal.type === "edit" && (
          <Form
            initial={modal.entry}
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
        title={labels.deleteTitle}
        message={
          modal.type === "delete" ? `Excluir "${modal.entry.name}"?` : ""
        }
        // persist() returns on failure WITHOUT closing, so a rejected delete
        // (a 404 from a stale second tab) leaves this dialog open. Without the
        // slot it sat silent and `Excluir` read as a dead button.
        error={error}
      />
    </div>
  );
}
