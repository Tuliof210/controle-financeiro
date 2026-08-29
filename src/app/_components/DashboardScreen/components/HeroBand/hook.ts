import type { BoardData } from "../Board/hook.ts";

interface HeroBandProps {
  data?: BoardData;
  refreshing?: boolean;
}

// `live` is the caret's state. The title block sits outside the board's
// `aria-busy` wrapper, so it has to know on its own whether a payload has
// landed and whether a refetch is still in flight. Figures live on
// ProjectedBalance, which only mounts inside the board.
function useHeroBand({ data, refreshing }: HeroBandProps) {
  const ready = data !== undefined && data.points.at(-1) !== undefined;

  return { live: ready && !refreshing };
}

export type { HeroBandProps };
export { useHeroBand };
