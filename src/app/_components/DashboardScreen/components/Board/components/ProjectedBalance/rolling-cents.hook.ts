import { useEffect, useRef, useState } from "react";

// --duration-slow, in the one place a token cannot reach: this interpolates a
// NUMBER, not a CSS property, so there is no custom property to read off the
// element. The name is the contract — if _tokens-motion.scss moves, this moves.
const DURATION_MS = 320;

// The scalar shape of --ease-out (cubic-bezier(0.16, 1, 0.3, 1)): ease-out
// quart. No bounce, no elastic — README rule on motion.
const EASE_QUART = 4;
const easeOut = (progress: number): number => 1 - (1 - progress) ** EASE_QUART;

// `globalThis.matchMedia?.` rather than `window.matchMedia`: this file is
// imported by a jsdom test that does not always install the API, and a throw
// here would take the whole card down for a preference lookup.
const prefersReducedMotion = (): boolean =>
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;

// Interpolates a money value between two payloads, so a control's effect on
// the answer is SEEN rather than inferred: switching the simulation on walks
// the projected balance to its new figure instead of blinking it.
//
// `undefined` means "no figure yet". The first real value is ADOPTED, never
// walked to — a page whose numbers count up on load is the orchestrated load
// sequence the product register bans, and it would also claim a change that
// never happened. Only a payload REPLACING a payload animates.
//
// Every figure on the card runs through this one hook with one curve and one
// duration, which is what keeps the arithmetic honest mid-flight: lerp(a) −
// lerp(b) is lerp(a − b), so `saldo − atual = delta` holds on every frame
// rather than only at the ends.
function useRollingCents(target?: number): number {
  const [display, setDisplay] = useState(target);
  // The last value actually painted — not `display`, which a cancelled frame
  // would leave stale in the closure. An interrupted roll resumes from where
  // the eye last saw the number, never from the value it was heading for.
  const painted = useRef(target);

  useEffect(() => {
    if (target === undefined) {
      return;
    }

    if (painted.current === undefined || prefersReducedMotion()) {
      painted.current = target;
      setDisplay(target);
      return;
    }

    const from = painted.current;
    const start = performance.now();
    let frame = 0;

    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / DURATION_MS);
      const value = Math.round(from + (target - from) * easeOut(progress));
      painted.current = value;
      setDisplay(value);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return display ?? 0;
}

export { useRollingCents };
