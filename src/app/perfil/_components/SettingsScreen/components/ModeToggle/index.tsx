import { type ModeToggleProps, useModeToggle } from "./hook.ts";
import styles from "./style.module.scss";

export function ModeToggle(props: ModeToggleProps) {
  const { name, legend, segments } = useModeToggle(props);

  return (
    <fieldset className={styles.toggle}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.segments}>
        {segments.map(({ mode, label, checked, select }) => (
          <label key={mode} className={styles.segment}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={mode}
              checked={checked}
              onChange={select}
            />
            <span className={styles.option}>{label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
