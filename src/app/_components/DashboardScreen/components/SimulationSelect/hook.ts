import type { ChangeEvent } from "react";
import type { SimulationView } from "@/lib/simulation.ts";

export interface SimulationSelectProps {
  value: SimulationView;
  // Takes the raw option string rather than a SimulationView: a <select>'s
  // value is a string, and the hook behind this one is what narrows it.
  onChange: (next: string) => void;
}

export function useSimulationSelect({
  onChange,
}: Pick<SimulationSelectProps, "onChange">) {
  return {
    handleChange: (event: ChangeEvent<HTMLSelectElement>) =>
      onChange(event.target.value),
  };
}
