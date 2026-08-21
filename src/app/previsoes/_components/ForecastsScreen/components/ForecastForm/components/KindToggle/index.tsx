import { type KindToggleProps, useKindToggle } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  classificacao: "Classificação",
} as const;

export function KindToggle(props: KindToggleProps) {
  const { name, options } = useKindToggle(props);

  return (
    <fieldset className={styles.toggle}>
      <legend className={styles.legend}>{COPY.classificacao}</legend>
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
