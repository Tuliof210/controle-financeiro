import { CEILING_CAPS, type CeilingCap, META_CAP } from "@/lib/ceiling-caps.ts";

interface CapSelectorProps {
  value: CeilingCap;
  // False until a monthly goal is saved in /configuracoes. The segment is left
  // out entirely rather than disabled: a target that cannot do anything is not
  // a choice, and a dead radio in a group of four reads as a bug.
  hasMeta: boolean;
  onChange: (cap: CeilingCap) => void;
}

// Meta is left out entirely rather than disabled when no monthly goal is saved:
// a target that cannot do anything is not a choice.
function offeredCaps(hasMeta: boolean) {
  if (hasMeta) {
    return CEILING_CAPS;
  }
  return CEILING_CAPS.filter((cap) => cap !== META_CAP);
}

// The percent sign is display only — the value that travels is the bare string,
// which is what the API's enum accepts. Meta is not a percentage, so it is the
// one segment labelled by name.
function capLabel(cap: CeilingCap): string {
  if (cap === META_CAP) {
    return "Meta";
  }
  return `${cap}%`;
}

function useCapSelector({ value, hasMeta, onChange }: CapSelectorProps) {
  const offered = offeredCaps(hasMeta);

  return {
    // `checked` is resolved here rather than in the JSX so the markup stays one
    // expression per segment. The percent sign is display only — the value that
    // travels is the bare string, which is what the API's enum accepts. Meta is
    // not a percentage, so it is the one segment labelled by name.
    segments: offered.map((cap) => ({
      cap,
      label: capLabel(cap),
      checked: cap === value,
      select: () => onChange(cap),
    })),
  };
}

export type { CapSelectorProps };
export { useCapSelector };
