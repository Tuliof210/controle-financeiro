// Every field is already a formatted string: the arithmetic and the rounding
// belong to the payload and to the card's own hook, and nothing here decides a
// number.
export type HeroProps = {
  monthly: string;
  splits: string;
  ratio: string;
  average: string;
  averageSplits: string;
  monthsLeft: string;
};

export function useHero(props: HeroProps) {
  return props;
}
