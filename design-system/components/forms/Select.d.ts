import * as React from "react";

export interface SelectOption {
  value: string;
  label: string;
}

/** Styled native select with label, hint and error states. */
export interface SelectProps {
  label?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  /** Array of strings or {value,label} objects. */
  options?: (string | SelectOption)[];
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export declare function Select(props: SelectProps): React.JSX.Element;
