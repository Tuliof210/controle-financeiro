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
  const { name: seedName = "", color: seedColor = PALETTE[0] } = initial ?? {};
  const [name, setName] = useState(seedName);
  const [color, setColor] = useState(seedColor);

  return {
    name,
    setName,
    color,
    setColor,
    submit: () => onSubmit({ name: name.trim(), color }),
  };
}
