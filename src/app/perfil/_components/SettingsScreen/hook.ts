import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";

// The folder and the component keep the Settings name on purpose: ProfileProvider,
// ProfileSelect and profile.helper.ts already speak of the ACTIVE profile — which
// person is selected in the header — and a ProfileScreen unrelated to that is a
// collision that costs a misread. "Perfil" is UI copy and the route (pt-BR); the
// code stays English and this stays the settings screen.
export function useSettingsScreen(): PageHeaderProps {
  return {
    title: "Perfil",
    subtitle: "Pessoas, objetivos e como o dashboard exibe seus números.",
  };
}
