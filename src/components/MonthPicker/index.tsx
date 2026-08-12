import { type MonthPickerProps, useMonthPicker } from "./hook.ts";
import styles from "./style.module.scss";

export function MonthPicker(props: MonthPickerProps) {
  const { label, id, year, month, months, years, onMonthChange, onYearChange } =
    useMonthPicker(props);

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      <div className={styles.selects}>
        <select
          id={`${id}-month`}
          aria-label={`${label} - mês`}
          className={styles.select}
          value={month}
          onChange={(event) => onMonthChange(Number(event.target.value))}
        >
          {months.map((monthLabel, index) => (
            <option key={monthLabel} value={index + 1}>
              {monthLabel}
            </option>
          ))}
        </select>
        <select
          id={`${id}-year`}
          aria-label={`${label} - ano`}
          className={styles.select}
          value={year}
          onChange={(event) => onYearChange(Number(event.target.value))}
        >
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>
              {yearOption}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
