import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface NoticeProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  // What assistive tech is told when this card replaces the board. `aria-busy`
  // and a dimmed surface are the visual half of that statement and announce
  // nothing on their own, so a screen-reader user changing the cap or the
  // simulation view used to get silence over a stale board.
  //
  // "alert" interrupts — a failed fetch is the only state here that earns it.
  // "status" waits for a pause — loading and the two the payload reports are
  // information, not emergencies. Omitted renders no live region at all.
  role?: "alert" | "status";
  // A way out of the state, when there is one. The error branch passes a retry;
  // nothing else can offer anything a reader could act on.
  action?: ReactNode;
}

export function useNotice({
  title,
  icon,
  children,
  role,
  action,
}: NoticeProps) {
  return { title, icon, children, role, action };
}
