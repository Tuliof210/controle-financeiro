import { createElement, type ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { vi } from "vitest";
import { ProfileContext } from "@/components/ProfileProvider/hook";
import type { Person } from "@/core/entities/person.entity";

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
// `wrap` hands back the probe wrapped in a Context.Provider (or any element
// tree) for a hook that reads context — e.g. useProfile. Pass the Provider
// with an explicit value directly rather than pulling in the real Provider
// component: its own effects (localStorage, fetch) never run under SSR
// anyway, so depending on that would be leaning on an accident, not a
// contract.
//
// Lives in lib/ because ARCHITECTURE.md has no test-infrastructure folder and
// one file does not earn one.
export function renderHook<R>(
  use: () => R,
  wrap: (children: ReactElement) => ReactElement = (children) => children,
): R {
  let captured: R | undefined;
  const Probe = () => {
    captured = use();
    return null;
  };
  renderToStaticMarkup(wrap(createElement(Probe)));
  return captured as R;
}

// Shared fixture for the `wrap` case above: any hook that reads useProfile
// (MovementForm/RecurrenceForm's shared useEntryForm) needs a ProfileContext
// value without a live ProfileProvider. Extracted here after
// MovementForm/hook.test.ts and RecurrenceForm/hook.test.ts each declared a
// byte-identical copy of both PEOPLE and withProfile.
export const PEOPLE: Person[] = [
  { id: "p1", name: "Marina", color: "cyan", createdAt: new Date() },
];

export const withProfile = (children: ReactElement) =>
  createElement(
    ProfileContext.Provider,
    {
      value: {
        profile: "p1",
        people: PEOPLE,
        label: "Marina",
        setProfile: vi.fn(),
      },
    },
    children,
  );
