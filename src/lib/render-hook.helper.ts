import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Test-only. Renders a hook once, on the server, so a `hook.ts` that DOES call
// React hooks stays testable under this repo's node-environment Vitest — no
// jsdom, no @testing-library, no new dependency. `.squad/learnings.md` is
// explicit that "this can't be tested" is a claim to verify rather than assert,
// and that the hook which ASSEMBLES a feature is the test target, not only the
// pure helper it calls.
//
// Known ceiling: there is no `act`, so a setter called from an EVENT (a click,
// a timer) is not observable. A setter called during the render itself is —
// React re-runs the same component immediately, and the loop below captures the
// last pass, which is how `show-all.hook.test.ts` walks its toggle round trip.
// Stateful hooks here still keep their state-dependent derivation in a pure
// exported function, so both branches stay readable as well as covered.
// ponytail: a 6-line probe instead of a jsdom + @testing-library stack; add
// those two dev dependencies if a future hook needs event-driven re-renders.
//
// Lives in lib/ because ARCHITECTURE.md has no test-infrastructure folder and
// one file does not earn one.
export function renderHook<R>(use: () => R): R {
  let captured: R | undefined;
  const Probe = () => {
    captured = use();
    return null;
  };
  renderToStaticMarkup(createElement(Probe));
  return captured as R;
}
