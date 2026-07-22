"use client";

import { useMoneyInput } from "./hook";
import styles from "./style.module.scss";

type MoneyInputProps = {
  valueCents: number;
  onChange: (cents: number) => void;
  id?: string;
  ariaLabel?: string;
};

export function MoneyInput(props: MoneyInputProps) {
  const { display, onChange, id, ariaLabel } = useMoneyInput(props);

  return (
    <div className={styles.field}>
      <span className={styles.prefix} aria-hidden>
        R$
      </span>
      <input
        className={styles.input}
        inputMode="decimal"
        value={display}
        onChange={onChange}
        id={id}
        aria-label={ariaLabel}
      />
    </div>
  );
}
