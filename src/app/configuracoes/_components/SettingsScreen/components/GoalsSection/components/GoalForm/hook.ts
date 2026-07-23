import { useState } from "react";

export type GoalFormValues = { name: string; targetCents: number };

export type GoalFormProps = {
  initial?: GoalFormValues;
  error?: string;
  submitLabel: string;
  onSubmit: (values: GoalFormValues) => void;
};

export function useGoalForm({
  initial,
  onSubmit,
}: Pick<GoalFormProps, "initial" | "onSubmit">) {
  const [name, setName] = useState(initial?.name ?? "");
  const [targetCents, setTargetCents] = useState(initial?.targetCents ?? 0);
  const [localError, setLocalError] = useState<string>();

  const handleSubmit = () => {
    if (targetCents < 1) {
      setLocalError("Informe um valor maior que zero");
      return;
    }
    setLocalError(undefined);
    onSubmit({ name, targetCents });
  };

  return {
    name,
    setName,
    targetCents,
    setTargetCents,
    localError,
    handleSubmit,
  };
}
