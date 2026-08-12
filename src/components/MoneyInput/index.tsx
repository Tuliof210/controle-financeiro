"use client";

import { useMoneyInput } from "./hook.ts";
import styles from "./style.module.scss";

interface MoneyInputProps {
  valueCents: number;
  onChange: (cents: number) => void;
  id?: string;
  ariaLabel?: string;
}

export function MoneyInput(props: MoneyInputProps) {
  const { display, inputRef, onChange, onFocus, onSelect, id, ariaLabel } =
    useMoneyInput(props);

  return (
    <div className={styles.field}>
      <span className={styles.prefix} aria-hidden>
        R$
      </span>
      <input
        ref={inputRef}
        className={styles.input}
        inputMode="decimal"
        value={display}
        onChange={onChange}
        onFocus={onFocus}
        onSelect={onSelect}
        id={id}
        aria-label={ariaLabel}
      />
    </div>
  );
}
