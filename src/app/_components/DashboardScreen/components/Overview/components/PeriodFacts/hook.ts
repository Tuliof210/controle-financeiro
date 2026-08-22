// One labelled figure on the period panel. Built by `buildFacts` — this
// component only lays them out, which is why the type lives here.
export interface Fact {
  key: string;
  label: string;
  value: string;
  sub: string;
}

export interface PeriodFactsProps {
  facts: Fact[];
}

export function usePeriodFacts({ facts }: PeriodFactsProps) {
  return { facts };
}
