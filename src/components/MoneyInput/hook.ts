import type { ChangeEvent } from "react";
import { digitsToCents, formatCents } from "./money.helper";

type UseMoneyInputProps = {
  valueCents: number;
  onChange: (cents: number) => void;
  id?: string;
  ariaLabel?: string;
};

export function useMoneyInput({
  valueCents,
  onChange,
  id,
  ariaLabel,
}: UseMoneyInputProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(digitsToCents(event.target.value));
  };

  return {
    display: formatCents(valueCents),
    onChange: handleChange,
    id,
    ariaLabel,
  };
}
