import { type TypeToggleProps, useTypeToggle } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  tipo: "Tipo",
} as const;

export function TypeToggle(props: TypeToggleProps) {
  const { name, options } = useTypeToggle(props);

  return (
    <fieldset className={styles.toggle}>
      <legend className={styles.legend}>{COPY.tipo}</legend>
      <div className={styles.segments}>
        {options.map(({ kind, label, checked, select }) => (
          <label key={kind} className={styles.segment}>
            <input
              className={styles.input}
              type="radio"
              name={name}
              value={kind}
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
