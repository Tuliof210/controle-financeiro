# The 25 / 50 / 75 segmented control

## Outcome
- The Teto de Gastos header-end holds three mutually exclusive segments — 25%,
  50%, 75% — in one bordered container: active segment filled and inverted,
  inactive segments on the card surface, no gaps between them.
- 50% is active on load. Clicking another segment refetches the dashboard at that
  cap, and the ceiling figures, the savings-capacity banner and the goal
  projections all move together.
- "Limitado por <mês>" and the current-month badge still render, on their own
  line under the card title.
- Reloading the page returns to 50%. Nothing is written to storage or the URL.

## Context

**Where the state lives.** Not in `CeilingCard` — `pace` and `goals` change with
the cap and they render in `SavingsSection`. Put `cap` in
`DashboardScreen/hook.ts` beside `profile`, add it to the effect's dependency
array and to the request:
`` apiGet<DashboardData>(`/api/dashboard?owner=${encodeURIComponent(profile)}`) ``
becomes the same literal plus `&cap=`. Drill `cap` and its setter
`DashboardScreen → Board → CeilingCard`. `Board/hook.ts` currently returns
`{ data, ceiling, current }` and `Board/index.tsx` renders
`<CeilingCard ceiling={ceiling} current={current} />`. Seed the state from the
default exported by `src/lib/ceiling-caps.ts` (task 02) — never a second literal
`50`.

**Expect a full-board flash in this task.** The effect calls `setData(null)` and
`DashboardScreen/index.tsx` renders `data?.status === "ok" ? <Board data={data} /> : null`,
so every cap click currently unmounts the board — including the button just
clicked — and resets `useShowAll`. Task 04 fixes that. Do not fix it here and do
not work around it in the component.

**Where the control renders.** `SectionCard`'s props are
`{ title; icon?; tone?; hint?; headerEnd?: ReactNode; children }` and its markup
puts `headerEnd` last in the title row:
`{headerEnd ? <div className={styles.headerEnd}>{headerEnd}</div> : null}`
with `.headerEnd { display: flex; align-items: center; gap: var(--space-2); margin-left: auto; flex-wrap: wrap; }`.
So the segmented control goes into `headerEnd` with **no SectionCard API change**.
There is no subtitle slot and `.titleRow` accepts no full-width child — the
badges move into `children` instead, as the FIRST element, where `.body`'s
`flex-direction: column; gap: var(--space-4)` already spaces them. `CeilingCard`
comments that Hero must stay the card's first `<dd>` provider; a badge `<div>`
adds no `<dd>`, so that holds. The badge classes `.limit` and `.now` already live
in `CeilingCard/_badges.scss` — reuse them, they only need a row wrapper.

**Imitate for the markup.** `src/components/ColorPicker/` is the repo's only
mutually-exclusive group: `<div role="radiogroup" aria-label="Cor">` wrapping
`<button type="button" role="radio" aria-checked={selected}>`, with a
`biome-ignore lint/a11y/useSemanticElements` because a native radio cannot render
a color fill. **That excuse does not apply here** — a segment is text, so a native
`<input type="radio">` + `<label>` group inside a `<fieldset>` with a visually
hidden `<legend>` lints clean with no ignore and needs less JS. Take that route
unless it measurably fights the styling; if you fall back to buttons, the ignore
comment must state a real reason.

**Imitate for the styling.** Style the active state off the a11y attribute, not
off a JS-joined class — `NavItem/style.module.scss` states why: *"aria-current is
the styling hook on purpose: the a11y signal and the active paint are the same
declaration, so neither can drift from the other."* The inverted fill recipe is
already in this card, `_badges.scss`:
`.now { border: var(--border-2) solid var(--color-border); background: var(--color-text); color: var(--color-surface); }`
Inactive segments: `background: var(--color-surface)`, `color: var(--color-text-muted)`.
Container: one `var(--border-2) solid var(--color-border)` around the group and
`var(--border-1) solid var(--color-border-subtle)` between segments — the print
shows segments sharing edges, not `gap`. `--radius-sm` (2px) at most;
`--radius-full` is avatars/dots only and `--radius-lg` (6px) is the hard ceiling.
Type: `--font-mono`, `--text-2xs`, `--tracking-wide`. Transition:
`var(--duration-fast) var(--ease-snappy)`. Every segment needs
`@include t.focus-ring;` from `_theme.scss` and a **44px minimum hit target** —
`ShowAllToggle` shows the pattern (`min-height: 44px; // src/styles/README.md rule 7(e)'s 44px floor.`).
No `box-shadow`: elevation is border-first and the hard offset shadows are scoped
to the primary action and the modal panel.

**Contrast is a property of the pair.** Measure the exact segment text against its
own fill in BOTH themes before shipping — `--color-text-muted` was hand-tuned to
clear 4.5:1 on `--color-surface` and `--color-bg`, but the active segment's
foreground sits on `--color-text` and must be checked separately.

**Copy.** The hint in `hints.ts` should say what the percentage means: the share
of the worst projected balance released as spendable. Keep it one sentence — task
01 already rewrote that string's tail.

## Scope
- In: a new `CapSelector` component folder under
  `CeilingCard/components/` (index.tsx + hook.ts + style.module.scss),
  `CeilingCard/index.tsx` + `hook.ts` + `_badges.scss`,
  `DashboardScreen/hook.ts` + `index.tsx`, `Board/hook.ts` + `index.tsx`,
  `hints.ts`.
- Out: `src/components/SectionCard/` (no API change is needed — if you think one
  is, re-read `.headerEnd`), the API, `SavingsSection/`, `Overview/`, `e2e/`.

## Verify
- `npm run lint`, `npm run build`, `npm test`.
- `wc -l` every touched file including `.scss`.
- In the browser preview: click each segment and confirm the card's headline
  figure, the savings-capacity banner and at least one goal's projected month all
  change; confirm 25 < 50 < 75 on the headline; confirm the two badges still read
  correctly on their new line.
- Keyboard: Tab reaches the group once, arrow keys move the selection, and the
  focus ring is visible on every segment in both themes.
- At 375px, confirm the header does not push the page's horizontal scrollWidth
  past its clientWidth.
- Toggle `[data-theme="dark"]` and re-read both states.

## Forbidden
- No `localStorage`, no URL/query-string persistence, no cookie.
- Do not compute the ceiling on the client — the cap must reach the server, or
  `pace` and the goals silently disagree with the card.
- Do not add a component to `src/components/` — this control has one consumer,
  and ARCHITECTURE promotes only on the second.
- Do not touch the loading behaviour of `DashboardScreen` (task 04).
