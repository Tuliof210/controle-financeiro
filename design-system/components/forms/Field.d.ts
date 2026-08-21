import * as React from "react";
import type { MvIconName } from "../core/Icon";

/**
 * Labeled input field. Supports plain text and a BRL money mask that stores
 * value in minor units (centavos) and renders tabular pt-BR currency.
 */
export interface FieldProps {
  label?: string;
  /** Native input type (ignored when money). */
  type?: string;
  /** Money mode: value is minor units (1099 → "R$ 10,99"), right-aligned tabular. */
  money?: boolean;
  /** In money mode this is an integer of centavos; otherwise a string. */
  value?: number | string | null;
  /** (nextValue, event) — nextValue is minor-unit number in money mode. */
  onChange?: (value: any, e?: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  /** Helper text below the field. */
  hint?: string;
  /** Error message; switches the field to the error state. */
  error?: string;
  /** Static prefix inside the control (e.g. "@"). */
  prefix?: string;
  iconLeft?: MvIconName;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  style?: React.CSSProperties;
}

export declare function Field(props: FieldProps): React.JSX.Element;
