import { CalendarRange, LayoutDashboard, TriangleAlert } from "lucide-react";
import { Button } from "@/components/Button/index.tsx";
import { NOTICE_COPY, outOfRangeSentence } from "../../notice-copy.helper.ts";
import { Notice } from "../Notice/index.tsx";
import { type ScreenNoticesProps, useScreenNotices } from "./hook.ts";

// The four states that replace the board, in one place. Split out of the screen
// under ARCHITECTURE.md's recursion rule — the same <Notice> shape four times is
// a child, not four branches in the page.
//
// Every one of them is announced: `aria-busy` and a dimmed surface are the visual
// half of a statement and say nothing on their own, so a screen-reader user whose
// cap change failed used to get silence over a stale board.
export function ScreenNotices(props: ScreenNoticesProps) {
  const { loading, error, onRetry, noRange, outOfRange } =
    useScreenNotices(props);

  return (
    <>
      {Boolean(loading) && (
        <Notice title="Carregando" icon={LayoutDashboard} role="status">
          {NOTICE_COPY.loading}
        </Notice>
      )}

      {/* The one state that interrupts, and the only one with a way out: every
          other branch is information, but a failed fetch leaves the reader with
          nothing and no route back except reloading the page. */}
      {Boolean(error) && (
        <Notice
          title="Erro"
          icon={TriangleAlert}
          role="alert"
          action={<Button onClick={onRetry}>{NOTICE_COPY.retry}</Button>}
        >
          {error}
        </Notice>
      )}

      {Boolean(noRange) && (
        <Notice title="Período global" icon={CalendarRange} role="status">
          {NOTICE_COPY.noRange}
        </Notice>
      )}

      {outOfRange !== null && (
        <Notice title="Período global" icon={CalendarRange} role="status">
          {outOfRangeSentence(outOfRange)}
        </Notice>
      )}
    </>
  );
}
