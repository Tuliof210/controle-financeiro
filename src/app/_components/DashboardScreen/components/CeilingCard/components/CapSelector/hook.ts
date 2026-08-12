import { CEILING_CAPS, type CeilingCap, META_CAP } from "@/lib/ceiling-caps.ts";

export type CapSelectorProps = {
  value: CeilingCap;
  // False until a monthly goal is saved in /configuracoes. The segment is left
  // out entirely rather than disabled: a target that cannot do anything is not
  // a choice, and a dead radio in a group of four reads as a bug.
  hasMeta: boolean;
  onChange: (cap: CeilingCap) => void;
};

export function useCapSelector({ value, hasMeta, onChange }: CapSelectorProps) {
  const offered = hasMeta
    ? CEILING_CAPS
    : CEILING_CAPS.filter((cap) => cap !== META_CAP);

  return {
    // `checked` is resolved here rather than in the JSX so the markup stays one
    // expression per segment. The percent sign is display only — the value that
    // travels is the bare string, which is what the API's enum accepts. Meta is
    // not a percentage, so it is the one segment labelled by name.
    segments: offered.map((cap) => ({
      cap,
      label: cap === META_CAP ? "Meta" : `${cap}%`,
      checked: cap === value,
    })),
    onChange,
  };
}
