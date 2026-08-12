import { ERROR_GLYPH } from "@/lib/glyphs.ts";
import { type TextFieldProps, useTextField } from "./hook.ts";
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
      {Boolean(error) && (
        <p className={styles.error}>
          <span aria-hidden={true}>{ERROR_GLYPH}</span> {error}
        </p>
      )}
    </div>
  );
}
