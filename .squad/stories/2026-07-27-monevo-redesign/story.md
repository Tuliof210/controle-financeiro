# Monevo — redesign the whole app against the Claude Design source

## Description
The owner designed a complete visual overhaul of the app in Claude Design and
wants it implemented. The source is
`Monevo.dc.html` in project `1452a6cc-5074-4206-aad0-0504b927f703`
(read it with the `DesignSync` tool: `method: get_file`, that `projectId`,
`path: "Monevo.dc.html"`). It redesigns the shell and all five screens, gives
the product a name — **Monevo** — and a pixel-block logo mark, and moves the
whole surface from the current flat, `--radius-0`, border-only look to a
denser, framed one: a dark navigation rail, display-font eyebrows on every
card, hard offset shadows on primary actions, and a real mobile layout.

**This story is the re-skin and nothing else.** The design also sketches eight
features that need data the API does not have. All of them were cut during
refinement (see *Cut, deliberately* below); no migration, no new endpoint, no
new dependency, no change to any existing API contract, no change to what any
screen can do. If a task finds itself needing a new field, it is off the rails
— stop and ask.

### The `--c-*` layer in the source is not a token proposal
`Monevo.dc.html` declares its own alias layer (`--c-bg`, `--c-surface`,
`--c-pos`, …) in a page-level `<style>` block because a standalone HTML file
has nowhere else to put it. **Do not port those names.** They map 1:1 onto
tokens this repo already has, and the implementation uses the repo's names:

| design | repo | design | repo |
|---|---|---|---|
| `--c-bg` | `--color-bg` | `--c-brand` | `--color-brand` |
| `--c-surface` | `--color-surface` | `--c-accent` | `--color-accent` |
| `--c-raised` | `--color-surface-raised` | `--c-pos` | `--color-positive` |
| `--c-text` | `--color-text` | `--c-neg` | `--color-negative` |
| `--c-muted` | `--color-text-muted` | `--c-caution` | `--color-caution` |
| `--c-border` | `--color-border` | `--c-info` | `--color-info` |
| `--c-line` | `--color-border-subtle` | `--c-grad` | `--gradient-toxic` |
| `--on-brand` | `var(--white)` (no token — brand is violet in both themes) | | |

Its layout aliases collapse the same way: `--card-p` → `--space-6`,
`--row-py` → `--space-3`, `--sec-gap` → `--space-6`,
`--page-pad` → `--space-10` (desktop) / `--space-4` (mobile),
`--h1` → `--text-2xl` (desktop) / `--text-lg` (mobile). They exist in the
source only to feed the density switch, which is cut — so they are not needed.

### Three corrections the design needs, applied everywhere
1. **`font-size: 8px` is not on the type scale.** The source uses a raw `8px`
   for the smallest eyebrows. Use `--text-2xs` (0.625rem = 10px). Rule 1 and
   rule 4.
2. **Every control reaches 44px.** The source draws 38px header buttons, a
   40px select, 42px tabs and 38px swatches. README rule 7(e) is a floor, not
   a suggestion. Raise them to 44px, or — where padding would shift the
   surrounding layout — keep the visual size and overlay a centred 44×44
   `::after` (`translate(-50%, -50%)`), the pattern `Tooltip` already uses and
   `.squad/learnings.md` records.
3. **The corner radii move up one step, not to `--radius-full`.** Cards and
   the modal take `--radius-md` (4px); buttons, inputs, chips, swatches, dots
   and bars take `--radius-sm` (2px); only the profile avatar and status dots
   may use `--radius-full`. Rule 2 caps at `--radius-lg`, so all of this is
   legal — but it is a break from today's uniform `--radius-0` and must be
   applied consistently, not per-taste.

### Decisions taken during refinement (do not re-litigate)
- **Rule 3 of `src/styles/README.md` is amended, not broken.** The design's
  `box-shadow: 3px 3px 0` on primary buttons and `8px 8px 0` on the modal is
  its signature; the rule as written forbids hard offset shadows outright. The
  owner chose to amend the constitution and tokenise the shadow (task 01)
  rather than hardcode it or drop it. Blur-based `--elevation-overlay` stays
  reserved for floating layers.
- **The navigation rail is dark in both themes**, via a new `--rail-*` token
  family declared in all three theme blocks (task 01).
- **The person control stays exactly as it is** — the native `<select>` in the
  header, restyled to fit. The design's second control (the `PESSOA` chip row
  under the page title) is **not** built: two controls for one piece of state
  is more code and one more thing to desynchronise.
- **The Metas tab's goal bar measures period coverage**, i.e.
  `accruedCents / targetCents` — how much of the goal the projected slack
  covers before the range ends — and the row's own text says exactly that. It
  does **not** measure money already set aside; that number does not exist.
  `.squad/learnings.md` (2026-07-25) is explicit that a bar's length, its tone
  and its label must all encode the same quantity.
- **No ticker bar** under the header. Three of its five figures have no data
  (`RESERVA`, `PRÓX. FATURA`), and the owner chose to drop the strip rather
  than ship a shortened one. The `RESERVA 65%` widget in the rail footer goes
  with it.
- **No period `<select>`** in the page header. The global range in
  Configurações stays the only window, so no client-side re-slicing of the
  dashboard series and no recomputed statistics.
- **The page header block is eyebrow + title + subtitle only** — no primary
  action button. On Movimentações it would duplicate the card's own add
  button; on Dashboard, OFX and Configurações it would be new behaviour.
- **The OFX loading state is an indeterminate bar + skeleton.** The source's
  four-step checklist announces "Conciliando com movimentações" and
  "Detectando recorrências", neither of which happens — `POST /api/ofx` is one
  round trip that parses and returns.
- **Modal forms are not restructured.** Task 03 restyles the modal chrome
  (eyebrow, title, close button, panel shadow) and leaves each form's submit
  exactly where it is. The design's `Cancelar` + CTA footer would mean moving
  the submit out of five form bodies, two of which (`EntryForm/index.tsx`,
  `GoalsSection/index.tsx`) sit within six lines of the 100-line cap. Flag it
  as a deviation in the PR; it is a candidate for its own story.
- **Icons stay `lucide-react`.** The source inlines hand-drawn `<path d>`
  strings; this repo has used lucide in 28 files since the beginning. The one
  exception is the Monevo mark itself, which has no lucide equivalent and
  ships as a small inline-SVG component.
- **The rail widths (264px / 80px) stay raw pixels** in
  `Aside/style.module.scss`, extending the `// ponytail:` note already there.
  Two fixed widths in one file do not earn a `--size-*` token family plus a
  new Storybook Foundations page.

### Cut, deliberately (each is a future story, not a gap here)
Goal `savedCents` ("já guardado", and the real progress bar it unlocks) ·
accent-colour picker · density switch (comfy/compact) · the whole `Aparência`
section in Configurações · "Importar como movimentações" on the OFX report ·
`RESERVA` widget and the ticker figures behind it · person roles
(admin/editor/leitor) · the "Repetir todo mês até Dez/27" checkbox in the
movement modal.

## Acceptance Criteria
- [ ] `src/styles/README.md` rule 3 is amended in place — it names the new
      hard-shadow tokens, says they are limited to the primary action and the
      modal panel, and keeps `--elevation-overlay` reserved for floating
      layers. `src/styles/docs/Elevation.mdx` shows every elevation token.
- [ ] The `--rail-*` family is declared in `:root`, in `[data-theme="dark"]`
      **and** in `:root:not([data-theme="light"])` inside the
      `prefers-color-scheme` block, and `src/styles/tokens.test.ts` requires
      all five in both buckets.
- [ ] The rail is dark in **both** themes, 264px wide, collapses to an 80px
      icon-only rail and back, and the collapse animates with
      `var(--duration-slow)`.
- [ ] The rail's brand block shows the Monevo mark, `MONEVO` and
      `PANORAMA FINANCEIRO`; the active nav item takes the brand fill plus a
      `--border-3` accent left edge.
- [ ] Below the `md` breakpoint the rail is gone and a fixed bottom navigation
      shows the five destinations with their short labels; above it, the
      bottom nav is gone and the rail is back. Nothing overlaps the last card
      at either width.
- [ ] Every screen's `<h1>` is replaced by the shared page header block —
      brand-coloured eyebrow, display-font title, muted subtitle — with the
      per-screen copy from the design.
- [ ] Primary buttons carry the hard offset shadow and, on `:active`, shift by
      2px with the shortened shadow. The modal panel carries the large one.
- [ ] Every `SectionCard` title is a display-font, `--tracking-wide` eyebrow in
      `--text-2xs`, and every card is `--radius-md` with a `--border-2` frame.
- [ ] The Dashboard shows three tabs — `Visão geral`, `Projeção`, `Metas` —
      and each renders the layout the design specifies. Switching tabs does
      not refetch.
- [ ] `Visão geral` opens with the dark hero card (projected end-of-range
      balance, delta badge, three facts) above three KPI cards that each carry
      a sparkline, then the two existing charts full-width.
- [ ] `Projeção` shows Folga de gastos and Uso da meta mensal side by side,
      each capped at 8 rows with a `Ver todos (N)` / `Mostrar menos` toggle.
- [ ] `Metas` shows the savings-capacity banner and a grid of goal cards whose
      bar, badge and text all state the same thing: how much of the goal the
      projected period covers.
- [ ] Movimentações and Recorrências show the section total in each card's
      header, an illustrated empty state when a section has no rows, and a
      full-width dashed add button at the bottom.
- [ ] Each recurrence row shows a coverage bar of its months inside the global
      range, plus the range label — replacing the plain interval text.
- [ ] `/leitor-ofx` accepts a file dropped onto the idle card (with a visible
      drag-over state) as well as one picked from the button; while parsing it
      shows an indeterminate bar and skeleton rows; the report shows the
      lançamentos badge and the metadata row.
- [ ] Configurações keeps its four sections, and the range card gains the
      month-tick timeline with the realised/projected split.
- [ ] Both themes and both widths (desktop and 375px) are correct on every
      screen, with no horizontal scroll on the page body and no console error.

## Definition of Done
- [ ] `npm run lint` reports **no NEW** problems versus the pre-change baseline
      of **2 errors + 1 info** — both errors in `.design-sync/gen-cards.mjs`
      (`format` + `organizeImports`), the info being the deprecated field in
      `biome.json`. Do not "fix" them, and **never run `npm run lint:fix`**: it
      is `biome check --write .` over the whole repo and will pull ~180 lines
      of unrelated churn from `.design-sync/gen-cards.mjs` into the PR.
- [ ] `npx tsc --noEmit` reports **no NEW** errors versus the pre-change
      baseline of **1 error**:
      `ThemeToggle/theme.helper.test.ts(21,22) TS2345`. Disclose this baseline
      with the same words used for lint — a body that discloses one gate and
      says only "zero new errors" for another reads as selective.
- [ ] `npm run test` green, measured with the worktrees excluded:
      `npx vitest run --exclude '**/.claude/**'`. Pre-change baseline:
      **45 files / 321 tests**. A plain `npm run test` from the main checkout
      globs `.claude/worktrees/*` and reports 90 / 642 — other branches' tests
      counted as yours.
- [ ] `npm run build` succeeds. Pre-change baseline: succeeds.
- [ ] The 100-line-per-file cap holds for every file touched. It fires at
      `info` severity, so it never fails `npm run lint` — read `Found N infos`
      against the baseline of 1. **Lines inside a JSX expression are not
      counted**, so every `index.tsx` escapes the rule while `hook.ts`,
      `*.helper.ts` and `*.test.ts` are policed; for a JSX-heavy file, count by
      hand. Three files start with almost no headroom and are all in scope:
      `EntryScreen/index.tsx` (102 effective), `GoalsSection/index.tsx` (95),
      `EntryForm/index.tsx` (94).
- [ ] Not one hardcoded colour, spacing, radius, shadow or duration is
      introduced. `grep -nE '#[0-9a-fA-F]{3,8}|[0-9]+ms|rgba?\(' src --include='*.scss'`
      returns nothing outside `src/styles/_tokens.scss` — that is true today
      and must stay true. Raw pixels are allowed only where the repo already
      allows them: the 44px hit target and the two rail widths.
- [ ] Every new transition uses `var(--duration-*)`; a literal duration
      silently opts out of `prefers-reduced-motion`, and nothing in the repo
      catches it.
- [ ] No accessibility invariant is lost. Specifically, still true after the
      change: `@include t.focus-ring` on all 16 existing sites and on every new
      control; `aria-current="page"` still both the a11y signal and the active
      nav item's styling hook; `MeterRow`'s `role="img"` still on the element
      carrying `aria-label`; the single `aria-live` region in `CopyButton`
      still rendered and not `display: none`; `Tooltip`'s bubble still in the
      DOM at all times so `aria-describedby` resolves; every `▲`/`▼` glyph
      still paired with its colour.
- [ ] No new dependency, no migration, no change to `prisma/schema.prisma`, no
      change to any `src/app/api/**` request or response shape, and no change
      to what any screen can do that it could not do before.
- [ ] Verified live in the browser preview on all five screens, in light and
      dark, at desktop width and at 375px, with `read_console_messages` clean.
      `preview_start`'s `{name}` launcher runs from the MAIN checkout — start
      the dev server manually from inside the worktree on a spare port and
      `preview_start` with `{url: "http://localhost:<port>"}`.

## Tasks
- [x] tasks/01-foundations.md — amend rule 3, add the hard-shadow and
      `--rail-*` tokens, extend the elevation mixin, update the test and the
      Foundations docs
- [x] tasks/02-shell.md — the dark collapsible rail, the Monevo mark, the
      header, the mobile bottom nav and the shared page header block
- [ ] tasks/03-primitives.md — restyle Button (plus a `dashed` variant),
      IconButton, Modal, SectionCard, the inputs and Tooltip
- [ ] tasks/04-dashboard-geral.md — the tab shell and the `Visão geral` tab:
      hero card, KPI cards with sparklines, the two charts
- [ ] tasks/05-dashboard-projecao-metas.md — the `Projeção` tab with its
      show-all toggles and the `Metas` tab's capacity banner and goal cards
- [ ] tasks/06-entries.md — Movimentações and Recorrências: section totals,
      empty states, dashed add button, recurrence coverage bar
- [ ] tasks/07-ofx.md — the dropzone, the indeterminate loading state and the
      restyled OFX report
- [ ] tasks/08-settings.md — Configurações: the two-column grid, the range
      timeline and the restyled sections
