import { Icon } from "@/components/Icon/index.tsx";
import { type SelectProps, useSelect } from "./hook.ts";
import styles from "./style.module.scss";

export type { SelectOption } from "./hook.ts";

export function Select(props: SelectProps) {
  const view = useSelect(props);

  return (
    <div className={styles.field}>
      <label htmlFor={view.id} className={styles.label}>
        {view.label}
      </label>
      <select
        id={view.id}
        aria-label={view.label}
        className={view.selectClass}
        value={view.value}
        disabled={view.disabled}
        required={view.required}
        aria-invalid={view.invalid || undefined}
        aria-describedby={view.describedBy}
        onChange={view.onChange}
      >
        {view.placeholder !== undefined && (
          <option value="" disabled={true}>
            {view.placeholder}
          </option>
        )}
        {view.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {Boolean(view.hint) && !view.invalid && (
        <p id={view.describedBy} className={styles.hint}>
          {view.hint}
        </p>
      )}
      {Boolean(view.error) && (
        <p id={view.describedBy} className={styles.error}>
          <Icon name="alertTriangle" /> {view.error}
        </p>
      )}
    </div>
  );
}
