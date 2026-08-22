import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";

export function useSettingsScreen(): PageHeaderProps {
  return {
    title: "Configurações",
    subtitle: "Pessoas e objetivos da família.",
  };
}
