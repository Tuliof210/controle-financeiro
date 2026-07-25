import { type SelectFieldProps, useSelectField } from "./hook";
import styles from "./style.module.scss";

export function SelectField(props: SelectFieldProps) {
  const { id, label, value, options, onChange } = useSelectField(props);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <select
        id={id}
        aria-label={label}
        className={styles.select}
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
