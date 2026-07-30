import { CEILING_CAPS, type CeilingCap } from "@/lib/ceiling-caps";

export type CapSelectorProps = {
  value: CeilingCap;
  onChange: (cap: CeilingCap) => void;
};

export function useCapSelector({ value, onChange }: CapSelectorProps) {
  return {
    // `checked` is resolved here rather than in the JSX so the markup stays one
    // expression per segment. The percent sign is display only — the value that
    // travels is the bare number, which is what the API's enum accepts.
    segments: CEILING_CAPS.map((cap) => ({
      cap,
      label: `${cap}%`,
      checked: cap === value,
    })),
    onChange,
  };
}
