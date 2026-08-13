# Product

Strategic design context for this project. Product truth — concepts, rules,
what the app computes — lives in `.squad/PRODUCT.md` and is not repeated here;
this file only carries what design decisions are judged against.

## Register

product

## Platform

web

## Users

One operator: the owner, on their own machine, checking in on a normal weekday.
Other family members exist inside the data as people who own forecasts and
movements, but nobody else ever drives the interface. That means the UI can be
dense and can assume fluency; it does not need to teach itself to a stranger.
The job is always the same one: decide whether there is room to spend or to
invest right now, without breaking a later month.

## Product Purpose

Project a cumulative balance forward from what was planned, correct it with
what actually happened, and turn that into a spendable ceiling. Success is that
the owner opens it, reads one figure, and stops thinking about money — and that
the figure holds up when the month closes.

## Positioning

It answers how much can still be spent, not where the money went. A ceiling
derived from every future month, not a budget imposed on this one.

## Brand Personality

Confident, opinionated, modern. It states the conclusion rather than laying out
data and leaving the arithmetic to the reader, and it does so quietly: the
first three seconds should read as calm reassurance, with alarm reserved for
something that is genuinely wrong. Serious about money the way Stripe's
dashboard is — legibility as trust — while keeping the consumer clarity of
Copilot Money, where the balance is the hero and the app is willing to say in a
sentence how you are doing.

## Anti-references

Brazilian bank apps — brand-colour floods, rounded promo cards, banners,
cross-sell, marketing voice inside a tool. Generic SaaS dashboards — the
gradient hero metric, four identical icon-and-number KPI cards, purple-blue
gradients, charts that exist because a dashboard is supposed to have one. A
spreadsheet in a browser — raw grids and hairlines with no hierarchy, data
dumped instead of answered. Gamified finance — mascots, confetti, streaks,
emoji categories, congratulatory toasts.

## Design Principles

- **Answer before evidence.** Every surface states its conclusion in words
  first; the table or chart underneath is the justification, not the message.
- **Calm by default, alarm when earned.** Colour semantics speak financial
  state and nothing else. A normal expense is not red.
- **Show the confidence of a claim.** Projected, real and simulated figures are
  never presented as the same kind of fact.
- **One instrument, not a set of widgets.** The same button, field, row and
  money treatment everywhere; consistency outranks novelty on every screen.
- **Restraint is the identity.** Neutrals carry the interface, cobalt is spent
  on action, focus and the mark — never as decoration.

## Accessibility & Inclusion

WCAG AA as enforced by `src/styles/README.md`: 4.5:1 body text (3:1 large) in
both themes with the measured ratio written beside the token, a visible focus
ring on every interactive element, meaning never carried by colour alone, and
motion that collapses to `0ms` under `prefers-reduced-motion`.
