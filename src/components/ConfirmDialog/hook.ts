const variantFor = (danger: boolean | undefined) => {
  if (danger) {
    return "danger" as const;
  }
  return "primary" as const;
};
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  // A failure raised by onConfirm, shown in place. Without it a rejected
  // delete (DELETE /api/people answers 409 for a person who still has
  // movements) leaves the dialog open with no explanation at all.
  error?: string;
  confirmLabel?: string;
  danger?: boolean;
}

export function useConfirmDialog({
  confirmLabel = "Excluir",
  danger = true,
}: Pick<ConfirmDialogProps, "confirmLabel" | "danger">) {
  return { confirmLabel, variant: variantFor(danger) } as const;
}
