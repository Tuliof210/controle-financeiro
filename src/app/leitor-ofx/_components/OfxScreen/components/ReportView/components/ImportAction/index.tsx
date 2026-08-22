import { Button } from "@/components/Button/index.tsx";
import { Field } from "@/components/Field/index.tsx";
import { Modal } from "@/components/Modal/index.tsx";
import { Select } from "@/components/Select/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { onSubmitForm } from "@/lib/form.helper.ts";
import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { type ImportActionProps, useImportAction } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  importar: "Importar",
  cancelar: "Cancelar",
} as const;

const FORM_ID = "ofx-import-form";
const IDENTIFIER_ID = "ofx-import-identifier";
const OWNER_ID = "ofx-import-owner";

export function ImportAction(props: ImportActionProps) {
  const view = useImportAction(props);

  return (
    <>
      {/* The default primary, now that FilePicker takes a variant and
          "Trocar arquivo" is ghost: this is the only control on the screen
          that writes anything, so it is the one that gets the cobalt. */}
      <Button onClick={view.openDialog} disabled={view.imported}>
        {COPY.importar}
      </Button>
      {/* Beside the button, never wrapping it: a disabled <button> fires no
          pointer or focus events, so a wrapper would hide the reason it is
          disabled. Tooltip brings its own focusable trigger. */}
      {view.tooltip !== null && (
        <Tooltip text={view.tooltip} label="Por que não posso importar" />
      )}

      <Modal
        open={view.open}
        onClose={view.close}
        eyebrow="Movimentações"
        title="Importar extrato"
        footer={
          <>
            <Button variant="ghost" onClick={view.close}>
              {COPY.cancelar}
            </Button>
            {/* The commit sits in Modal's footer, outside the <form> it
                submits — `form` is the attribute that reunites them, and it is
                what makes Enter in either field commit the import. */}
            <Button
              type="submit"
              form={FORM_ID}
              disabled={!view.canSubmit}
              loading={view.busy}
            >
              {view.submitLabel}
            </Button>
          </>
        }
      >
        {Boolean(view.open) && (
          <form
            id={FORM_ID}
            className={styles.form}
            onSubmit={onSubmitForm(view.submit)}
          >
            <Field
              id={IDENTIFIER_ID}
              label="Identificador do documento"
              value={view.identifier}
              onChange={view.setIdentifier}
              maxLength={view.maxLength}
              placeholder="Ex.: 12345-6"
            />
            <Select
              id={OWNER_ID}
              label="Responsável"
              value={view.ownerId}
              onChange={view.setOwnerId}
              options={view.options}
            />
            <p className={styles.summary}>{view.summary}</p>
            {Boolean(view.error) && (
              <p className={styles.error} role="alert">
                <span aria-hidden={true}>{ERROR_GLYPH}</span> {view.error}
              </p>
            )}
          </form>
        )}
      </Modal>
    </>
  );
}
