import { useState } from "react";
import { PALETTE } from "@/lib/palette.ts";

export interface PersonDraft {
  name: string;
  color: string;
}

export interface PersonFormProps {
  initial?: PersonDraft;
  error?: string;
  onSubmit: (draft: PersonDraft) => void;
  submitLabel: string;
}

export function usePersonForm({
  initial,
  onSubmit,
}: Pick<PersonFormProps, "initial" | "onSubmit">) {
  const [name, setName] = useState(initial?.name ?? "");
  const [color, setColor] = useState(initial?.color ?? PALETTE[0]);

  return {
    name,
    setName,
    color,
    setColor,
    submit: () => onSubmit({ name: name.trim(), color }),
  };
}
