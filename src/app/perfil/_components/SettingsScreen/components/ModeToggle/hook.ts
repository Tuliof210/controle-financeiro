import {
  SETTING_MODES,
  type SettingMode,
} from "@/core/entities/settings.entity.ts";

const MODE_LABELS: Record<SettingMode, string> = {
  percent: "Porcentagem",
  fixed: "Valor fixo",
};

export interface ModeToggleProps {
  // A prop and not a constant, unlike EntryForm's TypeToggle: that one lives in
  // a modal where only one is ever mounted, and this page carries two of these
  // at once. A shared name would put both in the same radio group, and picking
  // a mode in one card would clear the other.
  name: string;
  legend: string;
  value: SettingMode;
  onChange: (mode: SettingMode) => void;
}

// Segments arrive resolved — `checked` and a bound `select` — so index.tsx maps
// over ready values instead of building a closure per input in the JSX.
export function useModeToggle({
  name,
  legend,
  value,
  onChange,
}: ModeToggleProps) {
  return {
    name,
    legend,
    segments: SETTING_MODES.map((mode) => ({
      mode,
      label: MODE_LABELS[mode],
      checked: mode === value,
      select: () => onChange(mode),
    })),
  };
}

export { MODE_LABELS };
