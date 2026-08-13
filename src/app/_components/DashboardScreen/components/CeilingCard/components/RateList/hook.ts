// One cadence of the ceiling — the same figure per week and per day. The
// divisions already happened in the payload; the card's hook only formats them,
// and this only lays them out.
export interface Rate {
  key: string;
  label: string;
  value: string;
}

export interface RateListProps {
  rates: Rate[];
}

export function useRateList({ rates }: RateListProps) {
  return { rates };
}
