import {
  type ChangeEvent,
  type FocusEvent,
  type SyntheticEvent,
  useLayoutEffect,
  useRef,
} from "react";
import { digitsToCents, formatCents } from "@/lib/money.ts";

type UseMoneyInputProps = {
  valueCents: number;
  onChange: (cents: number) => void;
  id?: string;
  ariaLabel?: string;
};

function caretToEnd(el: HTMLInputElement) {
  const end = el.value.length;
  el.setSelectionRange(end, end);
}

export function useMoneyInput({
  valueCents,
  onChange,
  id,
  ariaLabel,
}: UseMoneyInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const display = formatCents(valueCents);

  // Pin the caret to the far right after every reformat so entry is
  // right-to-left (odometer): the field only ever appends a digit, making it
  // impossible to place the caret left of the comma and shift the value.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (input && document.activeElement === input) {
      input.setSelectionRange(display.length, display.length);
    }
  }, [display]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(digitsToCents(event.target.value));
  };

  const handleFocus = (event: FocusEvent<HTMLInputElement>) => {
    caretToEnd(event.currentTarget);
  };

  // Keep a *collapsed* caret pinned to the end so a mid-field click can't drop
  // the caret left of the comma. A range selection (select-all to clear) is
  // left intact, and pinning is a no-op once already at the end (no loop).
  const handleSelect = (event: SyntheticEvent<HTMLInputElement>) => {
    const el = event.currentTarget;
    if (
      el.selectionStart === el.selectionEnd &&
      el.selectionStart !== el.value.length
    ) {
      caretToEnd(el);
    }
  };

  return {
    display,
    inputRef,
    onChange: handleChange,
    onFocus: handleFocus,
    onSelect: handleSelect,
    id,
    ariaLabel,
  };
}
