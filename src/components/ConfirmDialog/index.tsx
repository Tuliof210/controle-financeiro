import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { Button } from "../Button/index.tsx";
import { Modal } from "../Modal/index.tsx";
import type { ConfirmDialogProps } from "./hook.ts";
import { useConfirmDialog } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  cancelar: "Cancelar",
} as const;

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  error,
  confirmLabel,
  danger,
}: ConfirmDialogProps) {
  const { confirmLabel: label, variant } = useConfirmDialog({
    confirmLabel,
    danger,
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {COPY.cancelar}
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {label}
          </Button>
        </>
      }
    >
      <p className={styles.message}>{message}</p>
      {Boolean(error) && (
        <p className={styles.error}>
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
        </p>
      )}
    </Modal>
  );
}
