// Generic over the id so each screen keeps its own narrow union — the
// dashboard's "geral" | "projecao" | "metas", the next screen's own — instead
// of this shared component owning a union of everybody's tabs.
export type Tab<Id extends string> = {
  id: Id;
  label: string;
  active: boolean;
};

export type TabBarProps<Id extends string> = {
  tabs: Tab<Id>[];
  onSelect: (id: Id) => void;
  // Names the group for a screen reader. A prop, not a constant, because
  // "Seções do painel" stopped being true the moment a second screen used it.
  label: string;
};

export function useTabBar<Id extends string>({
  tabs,
  onSelect,
  label,
}: TabBarProps<Id>) {
  return { tabs, onSelect, label };
}
