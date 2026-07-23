import { Button } from "../Button";
import { type ModalProps, useModal } from "./hook";
import styles from "./style.module.scss";

export type { ModalProps };

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const { ref, handleClose, handleClick } = useModal({ open, onClose });

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click is a mouse-only affordance; the native <dialog> already closes on Esc for keyboard users.
    <dialog
      ref={ref}
      className={styles.dialog}
      onClose={handleClose}
      onClick={handleClick}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {/* ponytail: plain Button as the close control until task 02's IconButton lands — swap then. */}
          <Button
            variant="ghost"
            aria-label="Fechar"
            className={styles.close}
            onClick={onClose}
          >
            ✕
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
