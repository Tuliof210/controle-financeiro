# Rail from `md`, bottom nav deleted

## Outcome
- No bottom bar renders at any width and `components/BottomNav/` no longer exists.
- From 768px up the rail is in the layout, expanded, still collapsible from the
  header hamburger.
- Below 768px nothing navigational renders yet (task 02 adds the drawer) — the
  hamburger is visible at every width and the header's brand mark is gone.
- `npm run test` green with the width constants updated to the new threshold.

## Context
- **Delete the stop, don't move it.** `src/styles/_theme.scss:16-31` carries a
  15-line comment justifying `"rail": 1904px` ("Below it, BottomNav carries
  navigation instead — see AppShell/components/Aside and .../BottomNav, the
  only consumers of this stop"). Both the key and the comment go; the six
  `@include t.bp("rail")` call sites become `t.bp("md")` (768px, already in
  `$breakpoints`). Call sites: `AppShell/style.module.scss:18,34`,
  `Aside/style.module.scss:21`, `Header/style.module.scss:55,67`,
  `BottomNav/style.module.scss:16` (that file is deleted).
- **Accepted tradeoff, state it in the code comment you leave behind.** 1904 was
  chosen so the content box never shrank as the window grew. At `md` it does:
  crossing 768 the content loses the rail's 264px *and* `.main`'s padding step
  (`--space-4` → `--space-10`, both sides) at once. The owner chose `md`
  knowing the rail costs that; the monotonicity test below must therefore stop
  bracketing the crossing rather than be made to pass on it.
- **`.main` clearance goes with the bar.** `AppShell/style.module.scss:30-31` —
  `// 96px of bottom room so the last card clears the fixed BottomNav bar.` /
  `padding-bottom: var(--space-24);` — and its `md` counterpart
  `padding-bottom: var(--space-12)`. Both exist only for the bar. `--space-24`
  is used by `ChartCard` and `Tooltip` for unrelated sizing — do not touch it
  in `_tokens.scss`.
- **Header today is the inverse of what is wanted.**
  `Header/style.module.scss` — `.toggle { display: none; … @include t.bp("rail")
  { display: flex; } }` and `.mark { display: flex; margin-right: auto; …
  @include t.bp("rail") { display: none; } }`, under the comment `// Mobile-first:
  the brand mark stands where the (rail-only) hamburger sits.` The hamburger
  becomes unconditional; `.mark` and its `<span className={styles.mark}>
  <BrandMark /></span>` in `Header/index.tsx:35-37` (plus the import on line 4
  and the stale comment on lines 22-24) go. `BrandMark` itself stays — `Aside`
  still uses it.
- **`short` dies with its only consumer.** `nav.ts:12-17` declares
  `short: string` on `NavEntry` and `nav.ts:19-21` says `One definition, two
  consumers … 'short' is the bottom-nav label`. Only `BottomNav/index.tsx:22`
  reads it. Drop the field, its per-entry values and the two-consumer framing in
  the comments here, in `nav.hook.ts:4-8` and in `AppShell/hook.ts:5-6`.
- **e2e width constants encode the old stop, verbatim.**
  - `e2e/row-columns.spec.ts:19-26` — `PINCHED = 768` ("A mid-range width below
    AppShell's rail threshold"), `RAIL_BEFORE = 1903`, `RAIL_AFTER = 1904`.
    1903/1904 no longer bracket anything. The monotonicity test
    (`:121-134`) pairs `[NARROW, PINCHED]` and `[RAIL_BEFORE, RAIL_AFTER]` and
    its comment states the rule the pairs obey: *"checked within a single
    RowGrid tier at a time"*. Keep that rule — pick the replacement pair by
    measuring, not by guessing which tier 768 lands in.
  - `e2e/row-overflow.spec.ts:4-7` (comment naming the "rail" stop) and `:7`
    `const WIDTHS = [375, 768, 1024, 1903, 1904];` — the interesting bracket is
    now 767/768.
  - `e2e/row-hit-target.spec.ts:48-52` — the comment blames the fixed bottom
    nav for the z-order at 375px. The `scrollIntoView({ block: "center" })` +
    `settle` it justifies stays (see `.squad/learnings.md`); only the reason
    changes.
- **Verify with** `npm run lint`, `npm run test`, and `wc -l` on every file you
  touch — Biome's line cap is `info`, never `error`, and never reads `.scss`.

## Scope
- In: `src/components/AppShell/**`, `src/styles/_theme.scss`, `e2e/row-*.spec.ts`.
- Out: `RowGrid` and its `_tiers.scss` (the row tiers are container-query
  driven and correct as they are); `src/styles/_tokens.scss`; any screen under
  `src/app/`.

## Verify
- `npm run lint`
- `npm run test` — the three `row-*` specs are the ones that can redden.
- Whether a row at 768px still clears `row-columns.spec.ts`'s `FLOOR = 100`,
  and which RowGrid tier 767 and 768 each land in, are measurements: take them
  in the browser at those two widths before rewriting the constants, and let
  what you measure decide the new bracket pair.
- `npm run dev`, then 1440px and 375px in the preview: rail present and
  collapsible at 1440, no bottom bar at either width.

## Forbidden
- Do not keep `BottomNav` behind a flag, a `display: none` or a comment — it is
  deleted.
- Do not re-add a `rail`-like stop under another name; `md` is the threshold.
- Do not weaken a `row-*` assertion (looser `toBeCloseTo`, dropped width,
  `test.skip`, `retries`) to get green — move the width constants, not the bar.
- Do not touch the drawer behaviour below `md`; that is task 02.
