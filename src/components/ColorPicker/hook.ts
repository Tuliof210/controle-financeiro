import { cx } from "@/lib/cx.ts";
import { PALETTE } from "@/lib/palette.ts";
import { PALETTE_LABELS } from "./labels.helper.ts";
import styles from "./style.module.scss";

export interface ColorPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export function useColorPicker({ value, onChange }: ColorPickerProps) {
  const swatches = PALETTE.map((key) => ({
    key,
    label: PALETTE_LABELS[key],
    selected: value === key,
    className: cx(styles.swatch, styles[key], value === key && styles.selected),
    select: () => onChange(key),
  }));

  return { swatches };
}
