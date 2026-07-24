"use client";

import { type MonthRangeSliderProps, useMonthRangeSlider } from "./hook";
import styles from "./style.module.scss";

export function MonthRangeSlider(props: MonthRangeSliderProps) {
  const {
    disabled,
    lastIndex,
    startIdx,
    endIdx,
    startLabel,
    endLabel,
    fillStartPct,
    fillEndPct,
    onStartChange,
    onEndChange,
  } = useMonthRangeSlider(props);

  return (
    <div className={styles.wrapper}>
      <p className={styles.labels}>
        {startLabel} → {endLabel}
      </p>
      <div className={styles.track}>
        <div className={styles.rail} />
        <div
          className={styles.fill}
          style={{ left: `${fillStartPct}%`, right: `${100 - fillEndPct}%` }}
        />
        <input
          type="range"
          className={styles.thumb}
          min={0}
          max={lastIndex}
          value={startIdx}
          disabled={disabled}
          aria-label="Mês inicial"
          onChange={(event) => onStartChange(Number(event.target.value))}
        />
        <input
          type="range"
          className={styles.thumb}
          min={0}
          max={lastIndex}
          value={endIdx}
          disabled={disabled}
          aria-label="Mês final"
          onChange={(event) => onEndChange(Number(event.target.value))}
        />
      </div>
    </div>
  );
}
