# Vigência card shell and header

## Outcome
- Each interval row renders as a card: `--color-surface` fill,
  `var(--border-2) solid var(--color-border)`, `--radius-md`,
  `padding: var(--space-6)`, children stacked with `gap: var(--space-5)`.
- Card header holds a `VIGÊNCIA` eyebrow on the left and, on the right, the
  `Mês único` toggle followed by the remove control — the latter only when more
  than one interval exists.
- The `Mês único` box is the DS square, not the browser's default checkbox.
- `Adicionar intervalo` is a single dashed full-width button below all cards.
- Lock behaviour is byte-identical to today: checking `Mês único` collapses to one
  `Mês` picker, unchecking restores `Início`/`Fim` — `e2e/interval-lock.spec.ts`
  passes untouched.

## Context

**The design** is block `1c` of `Seletor de Vigência.dc.html` (Claude Design
project `1452a6cc-5074-4206-aad0-0504b927f703`). One deliberate departure,
already decided — do not "fix" it back: **the `Fim` picker stays hidden when
locked** (today's behaviour), not disabled-but-visible as the design shows.
`MonthPicker` gains no `disabled` prop and `interval-lock.spec.ts` needs no edit.

Card and eyebrow declarations, verbatim from the design source:
```
background:var(--c-surface);border:var(--border-2) solid var(--c-border);
border-radius:var(--radius-md);padding:var(--space-6);display:flex;
flex-direction:column;gap:var(--space-5)
font-size:var(--text-xs);color:var(--c-muted);letter-spacing:var(--tracking-wide)
```
Eyebrow copy is uppercase. `--c-*` → repo token mapping: `tasks/01-select-skin.md`.

**Surface tiers already resolved.** `ForecastForm` renders inside `EntryScreen`
→ `Modals` → a `Modal` whose `.dialog` is `--color-surface-raised`. So dialog
`raised` › card `surface` › select `bg` (task 01) are three distinct tiers — that
is why the card must be `--color-surface`, not raised.

**Imitate** `src/components/SectionCard/style.module.scss`, the repo's canonical
version of that exact recipe:
```scss
.card {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--color-surface);
  border: var(--border-2) solid var(--color-border);
  border-radius: var(--radius-md);
}
```

**Reuse, verbatim signatures:**
- `Button` with `variant="dashed"` — `src/components/Button/hook.ts` declares
  `type Variant = "primary" | "ghost" | "danger" | "success" | "dashed"` and the
  dashed variant already implements the design's affordance including the
  brand-fill hover. Today's add button uses `variant="ghost"`; switch it.
- `IconButton` — `src/components/IconButton/hook.ts`:
  `{ variant?: "ghost" | "danger"; "aria-label": string; children: ReactNode } & ButtonHTMLAttributes`.
  Keep the existing `variant="danger"` and the existing
  `aria-label={\`Remover intervalo ${index + 1}\`}`; only its position changes.
- `addMonths(value: number, count: number): number` in `src/lib/months.ts`.

**The `Mês único` toggle must stay a native `<input type="checkbox">`** inside its
`<label htmlFor>`. `e2e/interval-lock.spec.ts` drives it with
`page.getByRole("checkbox", { name: "Mês único" })` plus `.check()` / `.uncheck()`;
a `<button>` with a fake box — what the design uses — breaks both the role and
those calls. Style the real input with `appearance: none` plus a `::after` check
mark. The design's box is
`width:20px;height:20px;border:var(--border-2) solid var(--c-border);border-radius:var(--radius-sm)`,
filled `--color-brand` when checked. Text/marks on a `--color-brand` fill are
`var(--white)` in this repo — the convention at five sites, e.g.
`Button/style.module.scss`: `.primary, .danger, .success { color: var(--white); }`.
There is no `--color-on-brand` token; do not add one.

**Watch out for:**
- `IntervalList/index.tsx` is already 83 lines against a 100-line/file cap. Extract
  the row into `IntervalCard/{index.tsx,hook.ts,style.module.scss}` under
  `IntervalList/components/` — the repeated-JSX recursion rule applies, the row is
  a `.map` body. `wc -l` every
  file you touch, `.scss` included: Biome's line rules are `info`, not `error`, and
  never read `.scss`.
- Lock state is *derived*, not stored: `start === end` means locked. Keep it
  derived. The unlock path must keep pushing `end` to `addMonths(end, 1)`, or the
  row instantly re-derives as locked.
- `min-height: 44px` on the toggle label and the 44px floor on the remove button
  are load-bearing. If padding would shift the layout, overlay an `::after` hit
  area instead of growing the box.
- Every interactive element needs `@include t.focus-ring;` from `_theme.scss`,
  verified with a real keyboard `Tab` press — a scripted `.focus()` can leave
  `:focus-visible` unmatched. And no `overflow: hidden` on the card: it clips
  those outlines.

## Scope
- In: `.../ForecastForm/components/IntervalList/` (all three files) plus the new
  `IntervalCard/` folder beneath it.
- Out: `ForecastForm/hook.ts`, `ForecastForm/index.tsx`, `IntervalListProps`,
  `intervals.helper.ts`, `intervals.hook.ts`, `src/components/MonthPicker/**`,
  `src/components/EntryForm/**`, `e2e/**`. The summary strip is task 03 — do not
  build it here.

## Verify
```bash
npm run lint
npm run test
wc -l src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/*.* src/app/previsoes/_components/ForecastsScreen/components/ForecastForm/components/IntervalList/components/IntervalCard/*.*
```
Then in the browser pane, light and dark, at 375px and 1280px: `/previsoes` →
`Nova previsão` → add a second interval, toggle `Mês único` on each, remove one.
`Tab` through the card, confirm a ring on every control, screenshot both themes.

## Forbidden
- Do not replace the checkbox with a `<button>`, and do not change its accessible
  name, its `id` scheme (`forecast-interval-<key>-lock`), or any `MonthPicker`
  `label` value (`Mês`, `Início`, `Fim`) — the spec locates by all four.
- Do not make the `Fim` picker visible-but-disabled when locked.
- No new prop on `IntervalList`; nothing is plumbed from `ForecastForm`.
- No hardcoded colour, spacing, radius or duration; no `data-testid`; no
  `--radius-full` on a rectangular surface; no hard offset shadow on the card.
- Do not touch `e2e/`.
