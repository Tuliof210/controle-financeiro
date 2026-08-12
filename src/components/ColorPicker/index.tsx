import { type ColorPickerProps, useColorPicker } from "./hook.ts";
import styles from "./style.module.scss";

export function ColorPicker(props: ColorPickerProps) {
  const { swatches, onChange } = useColorPicker(props);

  return (
    <div role="radiogroup" aria-label="Cor" className={styles.group}>
      {swatches.map(({ key, selected, className }) => (
        // biome-ignore lint/a11y/useSemanticElements: DS swatch is a styled square button; a native radio input can't render the color fill
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={key}
          className={className}
          onClick={() => onChange(key)}
        />
      ))}
    </div>
  );
}
