import type { DashboardTab } from "../../hook";

export type Tab = { id: DashboardTab; label: string; active: boolean };

export type TabBarProps = {
  tabs: Tab[];
  onSelect: (id: DashboardTab) => void;
};

export function useTabBar({ tabs, onSelect }: TabBarProps) {
  return { tabs, onSelect };
}
