import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";

export function useSettingsScreen(): PageHeaderProps {
  return {
    eyebrow: "AJUSTES",
    title: "Configurações",
    subtitle: "Pessoas e objetivos da família.",
  };
}
