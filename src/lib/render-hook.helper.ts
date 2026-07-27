import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

// Test-only. Renders a hook once, on the server, so a `hook.ts` that DOES call
// React hooks stays testable under this repo's node-environment Vitest — no
// jsdom, no @testing-library, no new dependency. `.squad/learnings.md` is
// explicit that "this can't be tested" is a claim to verify rather than assert,
// and that the hook which ASSEMBLES a feature is the test target, not only the
// pure helper it calls.
//
// Known ceiling: a server render is ONE pass, so only the initial state is
// observable and calling a returned setter changes nothing. Every stateful hook
// here therefore keeps its state-dependent derivation in a pure exported
// function (see `show-all.hook.ts`), so both branches stay covered.
// ponytail: a 6-line probe instead of a jsdom + @testing-library stack; add
// those two dev dependencies if a future hook needs a real re-render.
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
