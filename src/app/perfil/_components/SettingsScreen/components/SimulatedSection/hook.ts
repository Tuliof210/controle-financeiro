import type { ChangeEvent } from "react";

interface SimulatedSectionProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

// The event is unwrapped here so index.tsx stays a render: the checkbox is the
// only control on this card and its `checked` is the whole state.
function useSimulatedSection({ value, onChange }: SimulatedSectionProps) {
  return {
    value,
    handleChange: (event: ChangeEvent<HTMLInputElement>) =>
      onChange(event.target.checked),
  };
}

export type { SimulatedSectionProps };
export { useSimulatedSection };
