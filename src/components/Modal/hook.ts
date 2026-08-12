import { type MouseEvent, type ReactNode, useEffect, useRef } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  // Optional display-font kicker above the title. ConfirmDialog omits it.
  eyebrow?: string;
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
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // Native `close` fires on Esc and on our programmatic close(). Only bubble it
  // up while still open, so the close() our own effect triggers doesn't re-fire
  // onClose in a loop.
  const handleClose = () => {
    if (open) onClose();
  };

  // Backdrop click lands on the <dialog> itself (the panel is an inner box), so
  // target === dialog means the click was outside the content.
  const handleClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose();
  };

  return { ref, handleClose, handleClick };
}
