"use client";

import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PageHeader } from "@/components/PageHeader";
import type { Entry, EntryType } from "@/lib/entry-types";
import { Modals } from "./components/Modals";
import { Sections } from "./components/Sections";
import { useEntryScreen } from "./hook";
import styles from "./style.module.scss";
import type { EntryScreenConfig } from "./types";

export function EntryScreen<T extends Entry, V extends { type: EntryType }>(
  config: EntryScreenConfig<T, V>,
) {
  const { renderPeriod, renderBand, Form } = config;
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

      <Sections
        labels={labels}
        income={income}
        expense={expense}
        people={people}
        period={period}
        renderPeriod={renderPeriod}
        renderBand={renderBand}
        onAdd={openAdd}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <Modals
        labels={labels}
        modal={modal}
        close={close}
        error={error}
        people={people}
        onAdd={onAdd}
        onUpdate={onUpdate}
        Form={Form}
      />

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
