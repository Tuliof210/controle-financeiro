import type { PageHeaderProps } from "@/components/PageHeader/hook";

export function useSettingsScreen(): PageHeaderProps {
  return {
    eyebrow: "AJUSTES",
    title: "Configurações",
    subtitle: "Pessoas e objetivos da família.",
  };
}
