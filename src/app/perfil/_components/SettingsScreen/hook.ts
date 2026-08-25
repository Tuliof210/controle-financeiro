import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";
import type { CeilingSectionProps } from "./components/CeilingSection/hook.ts";
import type { GoalsLimitSectionProps } from "./components/GoalsLimitSection/hook.ts";
import { usePreferences } from "./preferences.hook.ts";

// The folder and the component keep the Settings name on purpose: ProfileProvider,
// ProfileSelect and profile.helper.ts already speak of the ACTIVE profile — which
// person is selected in the header — and a ProfileScreen unrelated to that is a
// collision that costs a misread. "Perfil" is UI copy and the route (pt-BR); the
// code stays English and this stays the settings screen.
const HEADER: PageHeaderProps = {
  title: "Perfil",
  subtitle: "Pessoas, objetivos e como o dashboard exibe seus números.",
};

// The three preference cards are presentational, so the field each one writes is
// bound here rather than in the JSX — index.tsx renders what this returns and
// builds nothing.
function useSettingsScreen() {
  const prefs = usePreferences();
  const { settings } = prefs;

  const ceiling: CeilingSectionProps = {
    mode: settings.ceilingMode,
    percent: settings.ceilingPercent,
    cents: settings.ceilingCents,
    maxCents: prefs.maxCents,
    onModeChange: (mode) => prefs.onModeChange("ceilingMode", mode),
    onPercentChange: (raw) => prefs.onPercentChange("ceilingPercent", raw),
    onCentsChange: (cents) => prefs.onCentsChange("ceilingCents", cents),
  };

  const goalsLimit: GoalsLimitSectionProps = {
    mode: settings.goalsMode,
    percent: settings.goalsPercent,
    cents: settings.goalsCents,
    maxCents: prefs.maxCents,
    onModeChange: (mode) => prefs.onModeChange("goalsMode", mode),
    onPercentChange: (raw) => prefs.onPercentChange("goalsPercent", raw),
    onCentsChange: (cents) => prefs.onCentsChange("goalsCents", cents),
  };

  return {
    header: HEADER,
    ceiling,
    goalsLimit,
    simulated: {
      value: settings.showSimulated,
      onChange: prefs.onSimulatedChange,
    },
    dirty: prefs.dirty,
    error: prefs.error,
    savedMessage: prefs.savedMessage,
    onSave: prefs.onSave,
  };
}

export { useSettingsScreen };
