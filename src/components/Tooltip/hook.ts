import type { KeyboardEvent } from "react";
import { useId } from "react";

export type TooltipProps = {
  text: string;
};

export function useTooltip({ text }: TooltipProps) {
  // Reveal/hide is pure CSS (:hover / :focus-within), but WCAG 1.4.13 wants
  // hover-or-focus content dismissible without moving focus — blurring the
  // trigger on Esc is that escape hatch. Pointer users dismiss by moving away.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") event.currentTarget.blur();
  };

  // useId is SSR-safe: aria-describedby must resolve to the same id on the
  // server and the client, or hydration warns.
  return { text, id: useId(), onKeyDown };
}
