import { PALETTE } from "@/lib/palette.ts";
import styles from "./style.module.scss";

export interface ColorPickerProps {
  value: string;
  onChange: (key: string) => void;
}

export function useColorPicker({ value, onChange }: ColorPickerProps) {
  const swatches = PALETTE.map((key) => ({
    key,
    selected: value === key,
    className: [
      styles.swatch,
      styles[key],
      value === key ? styles.selected : "",
    ]
      .filter(Boolean)
      .join(" "),
  }));

  return { swatches, onChange };
}
