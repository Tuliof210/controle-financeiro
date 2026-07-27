import { Button } from "../Button";
import { Modal } from "../Modal";
import { type ConfirmDialogProps, useConfirmDialog } from "./hook";
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
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
    </Modal>
  );
}
