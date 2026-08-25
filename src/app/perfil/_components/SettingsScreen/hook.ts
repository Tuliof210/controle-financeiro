import type { PageHeaderProps } from "@/components/PageHeader/hook.ts";
import type { CeilingSectionProps } from "./components/CeilingSection/hook.ts";
import type { GoalsLimitSectionProps } from "./components/GoalsLimitSection/hook.ts";
import { usePreferences } from "./preferences.hook.ts";

const HEADER: PageHeaderProps = {
  title: "Ajustes",
  subtitle: "Pessoas, objetivos e como o dashboard exibe seus números.",
};

function useSettingsScreen() {
  const prefs = usePreferences();
  const { settings, preview } = prefs;

  const ceiling: CeilingSectionProps = {
    mode: settings.ceilingMode,
    percent: settings.ceilingPercent,
    cents: settings.ceilingCents,
    headroomKind: preview.kind,
    maxCents: preview.maxCents,
    monthlyCents: preview.monthlyCents,
    onModeChange: (mode) => prefs.onModeChange("ceilingMode", mode),
    onPercentChange: (raw) => prefs.onPercentChange("ceilingPercent", raw),
    onCentsChange: (cents) => prefs.onCentsChange("ceilingCents", cents),
  };

  const goalsLimit: GoalsLimitSectionProps = {
    mode: settings.goalsMode,
    percent: settings.goalsPercent,
    cents: settings.goalsCents,
    headroomKind: preview.kind,
    maxCents: preview.maxCents,
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
    ready: prefs.ready,
    loading: prefs.loading,
    error: prefs.error,
    saving: prefs.saving,
    statusMessage: prefs.statusMessage,
    statusClass: prefs.statusClass,
    onRetry: prefs.onRetry,
  };
}

export { useSettingsScreen };
