import type {
  DashboardData,
  DashboardRange,
} from "@/app/api/dashboard/types.ts";
import { formatYyyymm } from "@/lib/months.ts";

// The screen's four whole-screen states, in words, plus the one of them that is
// assembled rather than fixed. It was five COPY fragments and three
// `formatYyyymm` calls inside the render — a sentence built in JSX is a sentence
// nobody can test.
export const NOTICE_COPY = {
  loading: "Somando lançamentos e compromissos do período…",
  noRange:
    "Nenhum lançamento ainda. Registre uma movimentação ou previsão para o período aparecer aqui.",
  retry: "Tentar de novo",
} as const;

// "O período global (Jan/26–Dez/28) não cobre o mês atual (Ago/26). Registre uma
// movimentação ou previsão nesse mês para incluí-lo."
export function outOfRangeSentence(range: DashboardRange): string {
  const span = `${formatYyyymm(range.start)}–${formatYyyymm(range.end)}`;

  return `O período global (${span}) não cobre o mês atual (${formatYyyymm(range.current)}). Registre uma movimentação ou previsão nesse mês para incluí-lo.`;
}

// The 'ok' variant or nothing. One predicate, in one place: the screen used to
// ask it here and again at the board's own branch, which is two places for the
// board's precondition to drift from the band's.
export function okPayload(data: DashboardData | null) {
  if (data?.status === "ok") {
    return data;
  }
}
