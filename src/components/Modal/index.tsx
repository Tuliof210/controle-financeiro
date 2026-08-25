import { Icon } from "@/components/Icon/index.tsx";
import { IconButton } from "../IconButton/index.tsx";
import type { ModalProps } from "./hook.ts";
import { useModal } from "./hook.ts";
import styles from "./style.module.scss";

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const { ref, handleClose } = useModal({ open, onClose });

  return (
    <dialog ref={ref} className={styles.dialog} onClose={handleClose}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
          </div>
          <IconButton
            aria-label="Fechar"
            className={styles.close}
            onClick={onClose}
          >
            <Icon name="x" size={16} />
          </IconButton>
        </header>
        <div className={styles.body}>{children}</div>
        {Boolean(footer) && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}
