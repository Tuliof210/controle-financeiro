// One labelled figure on the band's bottom strip. Built by the band's own hook
// (`buildFacts`) — this component only lays them out, which is why the type
// lives here rather than a second copy of the label wording.
export type Fact = {
  key: string;
  label: string;
  value: string;
  sub: string;
};

export type FactsProps = { facts: Fact[] };

export function useFacts({ facts }: FactsProps) {
  return { facts };
}
