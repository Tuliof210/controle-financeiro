import type { ReactNode } from "react";

export type RowLayoutProps = {
  // Owner-color dot; PersonRow has one, GoalRow won't.
  swatch?: ReactNode;
  // Name + amount — the primary tier, always present.
  primary: ReactNode;
  // Owner + period metadata — the secondary tier; GoalRow has none.
  secondary?: ReactNode;
  // Edit/delete cluster. Never wraps away: it sits in its own flex slot,
  // outside the primary/secondary wrap flow.
  actions: ReactNode;
};

// Nothing to derive — a pass-through keeps the folder shape uniform so every
// component is read the same way.
export function useRowLayout(props: RowLayoutProps) {
  return props;
}
