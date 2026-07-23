export type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
};

export function useConfirmDialog({
  confirmLabel = "Excluir",
  danger = true,
}: Pick<ConfirmDialogProps, "confirmLabel" | "danger">) {
  return { confirmLabel, variant: danger ? "danger" : "primary" } as const;
}
