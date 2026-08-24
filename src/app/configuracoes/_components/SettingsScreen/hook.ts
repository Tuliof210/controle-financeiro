import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";

export function useSettingsScreen(): PageHeaderProps {
  return {
    title: "Configurações",
    subtitle: "Pessoas, objetivos e a meta mensal da família.",
  };
}
