# The rail arrives only where the shell can afford it

## Outcome
- Growing the window never makes an entry row narrower. Specifically, the
  764px→768px cliff that drops a row from 680px to 372px is gone.
- Below the rail's new threshold, BottomNav still carries navigation — no
  viewport is left with neither.
- Closes `.squad/debt.md:27`.

## Context

**The cliff, measured.** Crossing `md` costs the content box 312px in one step,
from two rules firing at once:
- `src/components/AppShell/style.module.scss:16` — `.shell` goes
  `grid-template-columns: 1fr` → `auto 1fr`, areas `"header"/"main"` →
  `"aside header"/"aside main"`, materialising a **264px** column.
- `src/components/AppShell/style.module.scss:32` — `.main` padding goes
  `var(--space-4)` (16px) → `var(--space-10)` (40px): **48px** more.

The 264 lives at `src/components/AppShell/components/Aside/style.module.scss:14`,
whose comment already waives it:
```scss
  // ponytail: two raw widths, deliberately not a --size-* token family — a
  // token family plus a Foundations page for two numbers in one file is not
  // worth it. Promote if a third fixed width shows up.
  width: 264px;
```
`.collapsed { width: 80px }` at L34 is a **runtime** toggle the user controls, so
`main`'s width is not a pure function of the viewport — the threshold has to be
chosen against the expanded 264px, the worse case.

**Every `t.bp("md")` that participates in the rail swap** — all four must move
together or a viewport ends up with both the rail and BottomNav, or neither:
| file:line | what it switches |
|---|---|
| `AppShell/style.module.scss:16` | grid gains the `aside` column |
| `AppShell/style.module.scss:32` | `.main` padding 16→40, bottom 96→48 |
| `AppShell/components/Aside/style.module.scss:21` | `.aside` `display:none` → `flex`, sticky, `100vh` |
| `AppShell/components/BottomNav/style.module.scss:14` | `.nav` → `display: none` |

**Do not move these** — they are typography and header chrome, unrelated to the
content-width cliff: `Header/style.module.scss:23,55,67,82`,
`PageHeader/style.module.scss:16`, `HeroCard/style.module.scss:121`,
`GoalsTab/style.module.scss:25,112`, `ProjectionTab/style.module.scss:11`,
`GeneralTab/style.module.scss:20` (that one is `"lg"`).

- **Watch out for** `_theme.scss`'s closed breakpoint map (`sm 480 / md 768 /
  lg 1024 / xl 1280`). The threshold this task needs is unlikely to be one of
  them. `GeneralTab/style.module.scss:18-19` shows the repo's existing discomfort:
  *"The design stacks the KPIs into one column below 1240px; `lg` (1024px) is the
  closest stop in this repo's closed breakpoint map."* Adding a named stop to the
  map or taking a raw `min-width` are both open; a raw value needs a `ponytail:`
  comment, per every other raw layout number in this repo.
- **Watch out for** the e2e width constants that encode the old geometry. All
  three specs sample 768 deliberately: `row-columns.spec.ts` has
  `const PINCHED = 768` used by `keeps a readable name at ${PINCHED}px` and by the
  `[WIDE, NARROW, PINCHED]` loop; `row-overflow.spec.ts:4` has
  `const WIDTHS = [375, 768, 1024]`. After this change 768 is on the other side of
  the rail — these specs must still sample **both** sides of the new threshold, or
  the cliff can come back unnoticed.
- **Watch out for** `row-hit-target.spec.ts:37-39`, whose comment claims which
  RowGrid tier each width lands in: *"1440px keeps the row on one line with 30px
  buttons; 375px collapses it and steps them to 40px."* Widening `main` at some
  viewports can silently stop exercising the 40px half.
- **Verify with** `npm run lint`, `npm run test:e2e`, and a real browser at the
  widths you measure.

## Scope
- In: the four `t.bp("md")` sites listed above, `src/styles/_theme.scss` if the
  map gains a stop, and the width constants/comments in `e2e/row-columns.spec.ts`,
  `e2e/row-overflow.spec.ts`, `e2e/row-hit-target.spec.ts`.
- In: `src/components/EntryScreen/style.module.scss`'s comment, which currently
  claims *"the layout never gets worse as the window grows"* — true only once this
  lands.
- Out: the Aside's 264/80 widths and its collapse toggle. The two-column container
  queries in EntryScreen/SettingsScreen — they are container-based and re-derive
  themselves. RowGrid's tiers.

## Verify
```
npm run lint
npm run test:e2e
```
**Measure, do not assume, the new threshold.** Take it at execution time: serve
the app, and for a sweep of viewport widths read back an entry row's measured
inline size on `/recorrencias`, then pick the smallest width at which the rail can
appear without the row ending up narrower than it was 4px earlier. The e2e
suite drives its own server on :3100 — see `e2e/settle.helper.ts` before reading
any box, and `.squad/learnings.md` on running a second dev server.

Add an e2e assertion that pins the *property*, not the number: across a sweep of
widths on `/recorrencias`, a row's measured width must be monotonically
non-decreasing. That is the acceptance criterion, and it survives the threshold
moving again later.

## Forbidden
- Do not delete BottomNav or leave any width with no navigation.
- Do not solve this by shrinking the Aside or changing its collapse default.
- Do not convert the shell to a container query — the aside *is* what changes the
  container, so it cannot read it.
- Do not delete the 768px sample from the specs; move or supplement it so both
  sides of the new threshold stay covered.
