import { type TextFieldProps, useTextField } from "./hook";
import styles from "./style.module.scss";

export function TextField(props: TextFieldProps) {
  const { label, id, error, onChange, ...inputProps } = useTextField(props);

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type="text"
        className={styles.input}
        onChange={onChange}
        {...inputProps}
      />
      {error ? (
        <p className={styles.error}>
          <span aria-hidden>▲</span> {error}
        </p>
      ) : null}
    </div>
  );
}
