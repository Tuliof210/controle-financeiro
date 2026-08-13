import { useEffect, useRef, useState } from "react";
import { formatMoney } from "@/lib/money.ts";
import type { BoardData } from "./components/Board/hook.ts";

const REFRESHING = "Atualizando o teto…";

// Takes the payload rather than the figure so the caller needs no optional chain
// into a required field.
function monthlyOf(data: BoardData | undefined) {
  if (data === undefined) {
    return;
  }
  return data.ceiling.monthly;
}

// One line that says what the board is doing, to everyone at once.
//
// Two defects met here. A cap change replaces roughly forty figures in place, and
// `aria-busy` is not announced as a status by most screen readers, so the dimmed
// surface was the ONLY channel reporting it — a visual-only meaning, the mirror of
// the colour-only failure this codebase polices everywhere else. And that dim was
// `opacity` on the whole board, which drops every --color-text-muted figure under
// the 4.5:1 floor `src/styles/README.md` rule 7 states with no transient
// exemption (tracked in .squad/debt.md).
//
// A visible live region fixes both: sighted readers get a word instead of a
// contrast violation, and assistive tech gets the same word rather than silence.
//
// `refreshing` is already `pending && data !== null`, so it is never true on a
// first load — the reader who just navigated here is not told anything. The
// settled message names the FIGURE, not the request: what a reader needs is which
// number is on screen now.
export function useCapAnnouncement(
  data: BoardData | undefined,
  refreshing: boolean,
) {
  const monthly = monthlyOf(data);
  const [settled, setSettled] = useState("");
  const wasRefreshing = useRef(false);

  useEffect(() => {
    if (refreshing) {
      wasRefreshing.current = true;
      setSettled("");
      return;
    }
    if (wasRefreshing.current && monthly !== undefined) {
      wasRefreshing.current = false;
      setSettled(`Teto atualizado: ${formatMoney(monthly)} por mês`);
    }
  }, [refreshing, monthly]);

  if (refreshing) {
    return REFRESHING;
  }
  return settled;
}
