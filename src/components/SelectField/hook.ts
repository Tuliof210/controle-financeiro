import type { ChangeEvent } from "react";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: SelectFieldOption[];
  onChange: (value: string) => void;
}

export function useSelectField({ onChange, ...rest }: SelectFieldProps) {
  return {
    ...rest,
    onChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(event.target.value),
  };
}
