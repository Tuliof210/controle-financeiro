import type { ChangeEvent } from "react";
import styles from "./style.module.scss";

function helpId(id: string, hint?: string, error?: string) {
  if (hint || error) {
    return `${id}-help`;
  }
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function useSelect({ onChange, hint, error, ...rest }: SelectProps) {
  return {
    ...rest,
    hint,
    error,
    describedBy: helpId(rest.id, hint, error),
    invalid: Boolean(error),
    selectClass: [styles.select, error && styles.invalid]
      .filter(Boolean)
      .join(" "),
    onChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(event.target.value),
  };
}
