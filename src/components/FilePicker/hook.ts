import { type ChangeEvent, useRef } from "react";

export interface FilePickerProps {
  label: string;
  disabled?: boolean;
  onFile: (file: File) => void;
}

export function useFilePicker({ label, disabled, onFile }: FilePickerProps) {
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

  return { label, disabled, inputRef, open, change };
}
