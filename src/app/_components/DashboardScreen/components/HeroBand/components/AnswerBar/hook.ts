export interface AnswerBarProps {
  label: string;
  value: number;
  delta: number;
}

// A pass-through: every figure here is the band's own, already derived and
// already rolling. The bar restates them, it never recomputes them — two
// derivations of one answer is how they drift.
export function useAnswerBar(props: AnswerBarProps) {
  return props;
}
