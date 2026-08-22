import { type ReactNode, useEffect, useRef } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function useModal({
  open,
  onClose,
}: Pick<ModalProps, "open" | "onClose">) {
  const ref = useRef<HTMLDialogElement>(null);

  // Sync the native <dialog> top-layer state with the `open` prop. showModal()
  // gives focus-trap + Esc + ::backdrop for free; native focus returns to the
  // trigger on close.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Native `close` fires on Esc and on our programmatic close(). Only bubble it
  // up while still open, so the close() our own effect triggers doesn't re-fire
  // onClose in a loop.
  const handleClose = () => {
    if (open) {
      onClose();
    }
  };

  // Backdrop click lands on the <dialog> itself (the panel is an inner box), so
  // target === dialog means the click was outside the content. Bound through
  // the ref rather than as an onClick prop: a click handler in the JSX of a
  // non-interactive element is an a11y smell the linter rightly flags, and the
  // affordance is pointer-only anyway — Esc is what the keyboard uses, and the
  // native <dialog> already provides it.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    const onBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) {
        onClose();
      }
    };
    dialog.addEventListener("click", onBackdrop);
    return () => dialog.removeEventListener("click", onBackdrop);
  }, [onClose]);

  return { ref, handleClose };
}
