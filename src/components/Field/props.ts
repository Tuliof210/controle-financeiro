import type { MvIconName } from "@/components/Icon/hook.ts";

interface FieldBase {
  id: string;
  label: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  iconLeft?: MvIconName;
  maxLength?: number;
}

export type FieldProps =
  | (FieldBase & {
      money?: false;
      value: string;
      onChange: (value: string) => void;
    })
  | (FieldBase & {
      money: true;
      value: number;
      onChange: (value: number) => void;
      ariaLabel?: string;
    });

export function helpId(id: string, hint?: string, error?: string) {
  if (hint || error) {
    return `${id}-help`;
  }
}
