import type { KeyboardEvent } from "react";
import { useId, useState } from "react";

export interface TooltipProps {
  text: string;
  // Accessible name of the trigger. Defaults to the generic phrasing; callers
  // rendering several tooltips on one screen should pass a distinct one, or
  // every trigger reads identically in the element list.
  label?: string;
}

export function useTooltip({
  text,
  label = "Como este número é calculado",
}: TooltipProps) {
  // Reveal is pure CSS (:hover / :focus-within). WCAG 1.4.13 additionally
  // requires the content be dismissible *without moving* hover or focus —
  // blurring would move it — so Esc flips a flag instead and the trigger keeps
  // focus. Re-arming on blur/pointer-enter means the next visit shows it again.
  const [dismissed, setDismissed] = useState(false);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Escape" || dismissed) return;
    // Consume it: this primitive is used inside cards that can sit in a native
    // <dialog>, where the same keypress would otherwise also close the modal.
    event.stopPropagation();
    setDismissed(true);
  };

  const rearm = () => setDismissed(false);

  // useId is SSR-safe: aria-describedby must resolve to the same id on the
  // server and the client, or hydration warns.
  return { text, label, id: useId(), dismissed, onKeyDown, rearm };
}
