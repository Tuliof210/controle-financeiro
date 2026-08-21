import {
  FORECAST_KINDS,
  type ForecastKind,
  KIND_LABELS,
} from "@/lib/forecast-kinds.ts";

interface KindToggleProps {
  value: ForecastKind;
  onChange: (value: ForecastKind) => void;
}

// One option per kind, each carrying whether it is the current choice and its
// own bound handler — so index.tsx maps over ready values instead of building
// a closure per input in the JSX. Native radios, same as TypeToggle: `checked`
// is the state the browser announces, never colour alone.
function useKindToggle({ value, onChange }: KindToggleProps) {
  return {
    // Distinct from TypeToggle's "entry-type": both live in the same modal.
    name: "forecast-kind",
    options: FORECAST_KINDS.map((kind) => ({
      kind,
      label: KIND_LABELS[kind],
      checked: kind === value,
      select: () => onChange(kind),
    })),
  };
}

export type { KindToggleProps };
export { useKindToggle };
