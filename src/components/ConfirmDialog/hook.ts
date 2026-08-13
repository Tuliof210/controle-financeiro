import { useState } from "react";

const variantFor = (danger: boolean | undefined) => {
  if (danger) {
    return "danger" as const;
  }
  return "primary" as const;
};
export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  // Awaited, so the dialog can hold the button busy for exactly as long as the
  // delete is in flight. A void-returning handler is fine — it resolves at once.
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  // A failure raised by onConfirm, shown in place. Without it a rejected
  // delete (DELETE /api/people answers 409 for a person who still has
  // movements) leaves the dialog open with no explanation at all.
  error?: string;
  confirmLabel?: string;
  danger?: boolean;
}

// The busy state lives HERE rather than in each of the three screens that open
// a confirm: every one of them deletes over fetch, and none of them was
// guarding the button — a second click fired a second DELETE. Owning it here
// fixes all three at once and gives the confirm the same busy affordance the
// import got.
export function useConfirmDialog({
  confirmLabel = "Excluir",
  danger = true,
  onConfirm,
}: Pick<ConfirmDialogProps, "confirmLabel" | "danger" | "onConfirm">) {
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      // The dialog stays mounted on failure (persist() returns without
      // closing), so the button has to come back rather than stay spent.
      setBusy(false);
    }
  };

  return { confirmLabel, variant: variantFor(danger), busy, confirm } as const;
}
