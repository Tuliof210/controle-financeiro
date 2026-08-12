import { Modal } from "@/components/Modal/index.tsx";
import type { Entry, EntryType } from "@/lib/entry-types.ts";
import { type ModalsProps, useModals } from "./hook.ts";

export function Modals<T extends Entry, V extends { type: EntryType }>(
  props: ModalsProps<T, V>,
) {
  const { labels, modal, close, error, people, onAdd, onUpdate, form: Form } =
    useModals(props);

  return (
    <>
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
          />
        )}
      </Modal>
    </>
  );
}
