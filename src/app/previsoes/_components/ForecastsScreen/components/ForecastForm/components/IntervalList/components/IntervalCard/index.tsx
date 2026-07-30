import { X } from "lucide-react";
import { IconButton } from "@/components/IconButton";
import { MonthPicker } from "@/components/MonthPicker";
import { type IntervalCardProps, useIntervalCard } from "./hook";
import styles from "./style.module.scss";

export function IntervalCard(props: IntervalCardProps) {
  const {
    idPrefix,
    start,
    end,
    isLocked,
    canRemove,
    removeLabel,
    onStartChange,
    onEndChange,
    onMonthChange,
    onLockToggle,
    onRemove,
  } = useIntervalCard(props);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>Vigência</span>
        <div className={styles.controls}>
          <label className={styles.lock} htmlFor={`${idPrefix}-lock`}>
            <input
              type="checkbox"
              className={styles.checkbox}
              id={`${idPrefix}-lock`}
              checked={isLocked}
              onChange={onLockToggle}
            />
            Mês único
          </label>
          {canRemove ? (
            <IconButton
              variant="danger"
              aria-label={removeLabel}
              onClick={onRemove}
            >
              <X size={16} aria-hidden />
            </IconButton>
          ) : null}
        </div>
      </div>
      <div className={styles.pickers}>
        {isLocked ? (
          <MonthPicker
            id={`${idPrefix}-month`}
            label="Mês"
            value={start}
            onChange={onMonthChange}
          />
        ) : (
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
    </div>
  );
}
