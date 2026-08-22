import { Icon } from "@/components/Icon/index.tsx";
import { IconButton } from "@/components/IconButton/index.tsx";
import { MonthPicker } from "@/components/MonthPicker/index.tsx";
import { type IntervalCardProps, useIntervalCard } from "./hook.ts";
import styles from "./style.module.scss";

const COPY = {
  vigencia: "Vigência",
  mesUnico: "Mês único",
} as const;

export function IntervalCard(props: IntervalCardProps) {
  const {
    idPrefix,
    start,
    end,
    isLocked,
    canRemove,
    removeLabel,
    rangeLabel,
    durationLabel,
    onStartChange,
    onEndChange,
    onMonthChange,
    onLockToggle,
    onRemove,
  } = useIntervalCard(props);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{COPY.vigencia}</span>
        <div className={styles.controls}>
          <label className={styles.lock} htmlFor={`${idPrefix}-lock`}>
            <input
              type="checkbox"
              className={styles.checkbox}
              id={`${idPrefix}-lock`}
              checked={isLocked}
              onChange={onLockToggle}
            />
            {COPY.mesUnico}
          </label>
          {Boolean(canRemove) && (
            <IconButton
              variant="destructive"
              aria-label={removeLabel}
              onClick={onRemove}
            >
              <Icon name="x" size={16} />
            </IconButton>
          )}
        </div>
      </div>
      <div className={styles.pickers}>
        {Boolean(isLocked) && (
          <MonthPicker
            id={`${idPrefix}-month`}
            label="Mês"
            value={start}
            onChange={onMonthChange}
          />
        )}
        {!isLocked && (
          <>
            <MonthPicker
              id={`${idPrefix}-start`}
              label="Início"
              value={start}
              onChange={onStartChange}
            />
            <MonthPicker
              id={`${idPrefix}-end`}
              label="Fim"
              value={end}
              onChange={onEndChange}
            />
          </>
        )}
      </div>
      <div className={styles.summary}>
        <span className={styles.range}>{rangeLabel}</span>
        <span className={styles.duration}>{durationLabel}</span>
      </div>
    </div>
  );
}
