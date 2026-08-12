import { Button } from "../Button/index.tsx";
import { Modal } from "../Modal/index.tsx";
import { type ConfirmDialogProps, useConfirmDialog } from "./hook.ts";
import styles from "./style.module.scss";

export type { ConfirmDialogProps };

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
            Cancelar
          </Button>
          <Button variant={variant} onClick={onConfirm}>
            {label}
          </Button>
        </>
      }
    >
      <p className={styles.message}>{message}</p>
      {error ? (
        <p className={styles.error}>
          <span aria-hidden={true}>▲</span> {error}
        </p>
      ) : null}
    </Modal>
  );
}
