import type { Recurrence } from "@/core/entities/recurrence.entity";

export type InstallmentsTab = "compras" | "meses";

export const TAB_LABELS: [InstallmentsTab, string][] = [
  ["compras", "Compras"],
  ["meses", "Por mês"],
];

// One slot for all three dialogs, mirroring EntryScreen's ModalState. The
// screen's hook is the only thing allowed to move between these, so the error
// banner can be cleared on every transition.
export type PurchaseModal =
  | { type: "none" }
  | { type: "add" }
  | { type: "edit"; purchase: Recurrence }
  | { type: "delete"; purchase: Recurrence };
