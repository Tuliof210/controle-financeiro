import { type ColorPickerProps, useColorPicker } from "./hook.ts";
import styles from "./style.module.scss";

export function ColorPicker(props: ColorPickerProps) {
  const { swatches } = useColorPicker(props);

  return (
    <div role="radiogroup" aria-label="Cor" className={styles.group}>
      {swatches.map(({ key, label, selected, className, select }) => (
        // biome-ignore lint/a11y/useSemanticElements: DS swatch is a styled square button; a native radio input can't render the color fill
        <button
          key={key}
          type="button"
          role="radio"
          aria-checked={selected}
          aria-label={label}
          className={className}
          onClick={select}
        />
      ))}
    </div>
  );
}
