import type { ChangeEvent } from "react";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id: string;
  placeholder?: string;
  error?: string;
  maxLength?: number;
}

export function useTextField({ onChange, ...rest }: TextFieldProps) {
  return {
    ...rest,
    onChange: (event: ChangeEvent<HTMLInputElement>) =>
      onChange(event.target.value),
  };
}
