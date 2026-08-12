import { Button } from "@/components/Button/index.tsx";
import { Modal } from "@/components/Modal/index.tsx";
import { SelectField } from "@/components/SelectField/index.tsx";
import { TextField } from "@/components/TextField/index.tsx";
import { Tooltip } from "@/components/Tooltip/index.tsx";
import { type ImportActionProps, useImportAction } from "./hook.ts";
import styles from "./style.module.scss";

export function ImportAction(props: ImportActionProps) {
  const view = useImportAction(props);

  return (
    <>
      {/* `success`, not the default primary: "Trocar arquivo" beside it is
          already primary and FilePicker takes no variant, so a second one
          would leave the row with two equal-weight actions. This is also the
          only control on the screen that writes anything. */}
      <Button
        variant="success"
        onClick={view.openDialog}
        disabled={view.imported}
      >
        Importar
      </Button>
      {/* Beside the button, never wrapping it: a disabled <button> fires no
          pointer or focus events, so a wrapper would hide the reason it is
          disabled. Tooltip brings its own focusable trigger. */}
      {view.tooltip ? (
        <Tooltip text={view.tooltip} label="Por que não posso importar" />
      ) : null}

      <Modal
        open={view.open}
        onClose={view.close}
        eyebrow="Movimentações"
        title="Importar extrato"
        footer={
          <>
            <Button variant="ghost" onClick={view.close}>
              Cancelar
            </Button>
            <Button onClick={view.submit} disabled={!view.canSubmit}>
              {view.busy ? "Importando…" : "Importar"}
            </Button>
          </>
        }
      >
        {view.open && (
          <div className={styles.form}>
            <TextField
              id="ofx-import-identifier"
              label="Identificador do documento"
              value={view.identifier}
              onChange={view.setIdentifier}
              maxLength={view.maxLength}
              placeholder="Ex.: 12345-6"
            />
            <SelectField
              id="ofx-import-owner"
              label="Responsável"
              value={view.ownerId}
              onChange={view.setOwnerId}
              options={view.options}
            />
            <p className={styles.summary}>{view.summary}</p>
            {view.error ? (
              <p className={styles.error}>
                <span aria-hidden>▲</span> {view.error}
              </p>
            ) : null}
          </div>
        )}
      </Modal>
    </>
  );
}
