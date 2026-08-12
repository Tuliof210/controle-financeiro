import { X } from "lucide-react";
import { IconButton } from "../IconButton/index.tsx";
import { type ModalProps, useModal } from "./hook.ts";
import styles from "./style.module.scss";

export type { ModalProps };

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
}: ModalProps) {
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
          <div>
            {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
            <h2 className={styles.title}>{title}</h2>
          </div>
          {/* `danger`, not the default ghost: the design's close control turns
              red on hover. Resting state stays a quiet icon on a transparent
              surface either way. */}
          <IconButton
            variant="danger"
            aria-label="Fechar"
            className={styles.close}
            onClick={onClose}
          >
            <X size={16} aria-hidden />
          </IconButton>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
}
