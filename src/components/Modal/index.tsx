import { Icon } from "@/components/Icon/index.tsx";
import { IconButton } from "../IconButton/index.tsx";
import type { ModalProps } from "./hook.ts";
import { useModal } from "./hook.ts";
import styles from "./style.module.scss";

export function Modal({
  open,
  onClose,
  eyebrow,
  title,
  children,
  footer,
}: ModalProps) {
  const { ref, handleClose } = useModal({ open, onClose });

  return (
    <dialog ref={ref} className={styles.dialog} onClose={handleClose}>
      <div className={styles.panel}>
        <header className={styles.header}>
          <div>
            {Boolean(eyebrow) && <p className={styles.eyebrow}>{eyebrow}</p>}
            <h2 className={styles.title}>{title}</h2>
          </div>
          {/* `danger`, not the default ghost: the design's close control turns
              red on hover. Resting state stays a quiet icon on a transparent
              surface either way. */}
          <IconButton
            variant="destructive"
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
