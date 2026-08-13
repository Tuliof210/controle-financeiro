import { type ChangeEvent, useRef } from "react";
import type { ButtonProps } from "@/components/Button/hook.ts";

export interface FilePickerProps {
  label: string;
  // Defaults to Button's own default. It exists because ReportView needs this
  // one ghost: cobalt marks the action a screen is FOR, and on the OFX report
  // that is "Importar", not the picker that throws the parsed report away.
  variant?: ButtonProps["variant"];
  disabled?: boolean;
  onFile: (file: File) => void;
}

export function useFilePicker({
  label,
  variant,
  disabled,
  onFile,
}: FilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const open = () => inputRef.current?.click();

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFile(file);
    }
    // Without this reset, picking the SAME file twice fires no change event
    // and "Trocar arquivo" silently does nothing the second time.
    event.target.value = "";
  };

  return { label, variant, disabled, inputRef, open, change };
}
