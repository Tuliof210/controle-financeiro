import {
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { digitsToCents, formatCents } from "@/lib/money.ts";
import { caretToEnd, shouldPinCaret } from "./money.helper.ts";
import { type FieldProps, helpId } from "./props.ts";
import styles from "./style.module.scss";

export type { FieldProps } from "./props.ts";

export function useField(props: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isMoney = props.money === true;
  let display = "";
  if (props.money === true) {
    display = formatCents(props.value);
  } else {
    display = props.value;
  }

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (isMoney && input && document.activeElement === input) {
      input.setSelectionRange(display.length, display.length);
    }
  }, [display, isMoney]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (props.money === true) {
      props.onChange(digitsToCents(event.target.value));
      return;
    }
    props.onChange(event.target.value);
  };

  const onSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    if (isMoney && shouldPinCaret(event.currentTarget)) {
      caretToEnd(event.currentTarget);
    }
  };

  const onFocus = (event: FocusEvent<HTMLInputElement>) => {
    if (isMoney) {
      caretToEnd(event.currentTarget);
    }
  };

  let inputMode: "decimal" | undefined;
  if (isMoney) {
    inputMode = "decimal";
  }

  let ariaLabel: string | undefined;
  if (props.money === true) {
    ({ ariaLabel } = props);
  }

  return {
    ...props,
    display,
    inputRef,
    describedBy: helpId(props.id, props.hint, props.error),
    invalid: Boolean(props.error),
    controlClass: [
      styles.control,
      props.error && styles.invalid,
      props.money && styles.money,
    ]
      .filter(Boolean)
      .join(" "),
    isMoney,
    ariaLabel,
    onChange,
    onFocus,
    onSelect,
    inputMode,
  };
}
