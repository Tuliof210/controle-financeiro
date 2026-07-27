# Configurações — two-column grid, the range timeline, restyled sections

## Description
The last screen. Its four sections stay exactly as they are functionally —
Pessoas, Período (today titled "Range"), Meta mensal, Objetivos — and get the
design's treatment:

- The grid gains `align-items: start` so the four cards stop stretching to the
  tallest row, which is what makes today's layout look loose.
- **The Período card gains a month-tick timeline**: one tick per month of the
  configured range, solid for months already elapsed and hatched for projected
  ones, with a `N meses · X realizados · Y projetados` caption underneath. This
  is the one piece of new composition, and every number in it comes from
  `settings` plus the current month — no fetch is added.
- Pessoas, Meta mensal and Objetivos get the new card chrome, the dashed add
  button and the design's row anatomy.

**The `Aparência` section is not built.** The design puts theme, accent colour
and density in it; accent and density were cut during refinement (they need a
token layer this story does not add), and a theme selector here would be a
second control for the state the header's `ThemeToggle` already owns. An
empty-but-for-one-control section is worse than no section.

**Person roles are not built.** The design's rows show `admin` / `editor` /
`leitor`; `Person` has `{ id, name, color, createdAt }` and nothing else.

## When to run
- Depends on: 02-shell.md (`PageHeader` replaces the screen's `<h1>`) and
  03-primitives.md (`SectionCard`, `Button`'s `dashed` variant, `Modal`'s
  eyebrow, `IconButton`, `MonthPicker`, `MoneyInput`, `ColorPicker`, `TextField`).
  Run after both merge and `git fetch origin main` first.
- Parallel-safe with: 04, 05, 06 and 07 — no shared file.

## How-to

### Files
```
src/app/configuracoes/_components/SettingsScreen/index.tsx | style.module.scss  (edit)
src/app/configuracoes/_components/SettingsScreen/components/RangeSection/ index|hook|style (edit)
src/app/configuracoes/_components/SettingsScreen/components/RangeSection/components/RangeTimeline/ index|hook|style + hook.test.ts (new)
src/app/configuracoes/_components/SettingsScreen/components/PeopleSection/**       (edit)
src/app/configuracoes/_components/SettingsScreen/components/MonthlyGoalSection/**  (edit)
src/app/configuracoes/_components/SettingsScreen/components/GoalsSection/**        (edit)
```

### 1. The grid
```scss
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
  align-items: start;      // the change that matters

  @include t.bp("md") { grid-template-columns: repeat(2, 1fr); }
}
```
Order stays Pessoas, Período, Meta mensal, Objetivos.

Rename the Período card's title from the current literal **`Range`** to
**`Período da projeção`** — the design's wording, and the only Portuguese-free
label left in the UI. `SectionCard` uppercases titles via `text-transform` after
task 03, so pass it in sentence case.

### 2. `RangeTimeline`
Props: `{ start: number; end: number; current: number }` (all `YYYYMM`).
`hook.ts` is **pure — it calls no React hook** — so it is directly testable and
gets `hook.test.ts`. `.squad/learnings.md` records this waiver being claimed
falsely three times; the no-jsdom limit blocks *rendering*, not a plain
function.

```ts
// One tick per month of the configured range. `done` months are already
// elapsed (<= current) and draw solid; the rest are projected and draw hatched.
export function useRangeTimeline({ start, end, current }) {
  const months = buildMonths(start, end);          // from @/lib/months
  const done = months.filter((m) => m <= current).length;
  return {
    ticks: months.map((month) => ({ month, done: month <= current })),
    caption: `${months.length} ${months.length === 1 ? "mês" : "meses"} · ${done} realizados · ${months.length - done} projetados`,
    srLabel: `Período de ${formatYyyymm(start)} a ${formatYyyymm(end)}: ${done} de ${months.length} meses realizados`,
  };
}
```
`buildMonths` is inclusive and returns `[]` for an inverted range — which is
reachable (`PUT /api/settings` only refines `rangeEnd >= rangeStart` when both
are present in the same patch, so a two-step edit can invert it). Render nothing
when `ticks` is empty rather than a caption reading `0 meses · 0 realizados`.

```tsx
<div className={styles.timeline} role="img" aria-label={srLabel}>
  {ticks.map(({ month, done }) => (
    <span key={month} className={`${styles.tick} ${done ? styles.done : styles.todo}`} />
  ))}
</div>
<p className={styles.caption}>{caption}</p>
```
```scss
.timeline { display: flex; gap: 2px; }
.tick {
  flex: 1; height: 26px;
  border: var(--border-1) solid var(--color-border-subtle);
  border-radius: var(--radius-sm);
}
.done { background: var(--color-brand); }
.todo {
  background: repeating-linear-gradient(
    45deg, var(--color-brand) 0 2px, transparent 2px 5px
  );
}
.caption {
  display: flex; justify-content: space-between;
  margin: var(--space-2) 0 0;
  color: var(--color-text-muted);
  font-size: var(--text-2xs);
}
```
The `2px` gap and the `26px` tick height are the design's; both are raw pixels
in a decorative strip and neither is spacing between content blocks — acceptable
here, the same way the 44px hit target is. Do not invent a token for them.

**Solid means elapsed, hatched means projected, and the caption says exactly
that.** One quantity, three channels agreeing — the rule
`.squad/learnings.md` records from the coverage-meter bug (2026-07-25).

`hook.test.ts`: a 24-month range with the current month in the middle; the
current month equal to `start` (1 realizado); equal to `end` (all realizado); a
current month **outside** the range on both sides (0 and all); a single-month
range (`1 mês`, singular); and an inverted range (`ticks` empty).

Render it inside `RangeSection` below the existing `MM/AA → MM/AA` summary row,
and **only when both `rangeStart` and `rangeEnd` are set** — the section already
has a "Nenhum período definido" state that must stay.

`RangeSection` gets `current` from `currentYYYYMM()` in `@/lib/months`. Compute
it in the section's `hook.ts`, not during render of a child.

### 3. `RangeSection` and `MonthlyGoalSection` — the summary rows
Both are the same shape today: a `space-between` row with a summary `<p>` and a
ghost `Editar` `Button`. Keep it. Restyle only:
- the summary value to `--text-2xl`, `tabular-nums` for the money one
  (`MonthlyGoalSection`), `--text-lg` for the `Jan/26 → Dez/27` one, with the
  arrow in `--color-brand`;
- a muted caption line under each (`teto de gastos por mês para a família` for
  the meta; the timeline caption serves as the range's);
- the `Editar` button keeps its 44px floor.

**`MonthlyGoalSection`'s `0`-is-not-unset trap stays as it is.** The codebase
treats `0` as unset in two places (`limit.helper.ts` via `goalCents ? … : null`
and this section via `savedGoalCents > 0 ? … : "—"`), and `MoneyInput` seeds its
field to `0`. Do not change either comparison while restyling; a new
`=== null` check here would silently disagree with the dashboard.

`RangeSection`'s save gate — the modal's `Salvar` is disabled until `touched` —
also stays. `MonthPicker` self-seeds an `onChange(currentYYYYMM())` the instant
it renders with `value=null`, indistinguishable from a real pick, and that flag
is the only thing stopping Save from persisting a default nobody chose. It has
already bitten this section twice.

### 4. `PeopleSection` and `GoalsSection`
Row anatomy, per the design:
- **Pessoa**: colour dot (14px, `--radius-sm`, from `_swatch-colors.scss`) ·
  name (`flex: 1`) · edit `IconButton` · delete `IconButton` (danger). **No role
  column** — no such field. Row `padding: var(--space-4) var(--space-2)`,
  `border-bottom: var(--border-1) solid var(--color-border-subtle)`,
  hover `--color-surface-raised`.
- **Objetivo**: name (`flex: 1`, ellipsised) · `formatMoney(targetCents)` ·
  edit `IconButton` · delete `IconButton`.

The design puts a progress badge on the objective row. **Delete the placeholder
instead.** `GoalsSection/index.tsx` currently renders a hardcoded muted
`"— progresso em breve"` for every goal; the real percentage needs `savedCents`,
which is cut. A badge showing the dashboard's period-coverage figure would mean
fetching `/api/dashboard` from a settings section for one number. Remove the
placeholder string and ship the row without a badge — a promise deleted is
better than a promise restated. Say so in the PR body.

Both sections' bottom button becomes `<Button variant="dashed">` with a `Plus`
icon: `Adicionar pessoa` / `Adicionar objetivo` (the design's copy — today both
say just `Adicionar`).

Both keep their `ConfirmDialog` on delete, with today's copy verbatim, and both
keep every error path. `DELETE /api/people` maps Prisma's `P2003` to a 409 with
the message *"Pessoa possui registros vinculados"* — that is the only thing
standing between a linked person and an uncaught 500, and it must still surface
in the UI after the restyle. Test it live (see below).

**`GoalsSection/index.tsx` is at 95 effective lines against the 100-line cap.**
Removing the placeholder buys a line or two; the dashed button and the icon cost
them back. Count by hand — the rule reports at `info` and will not fail
`npm run lint`, and lines inside a JSX expression are not counted, so nothing
will warn you. If it goes over, extract the `<li>` into a `GoalRow` component
folder, mirroring `PeopleSection/components/PersonRow` which already exists for
exactly this reason.

### 5. The modals
Task 03 gave `Modal` an optional `eyebrow`. Use it here — it is the design's
own pattern and these four modals are where it reads best:

| modal | eyebrow | title |
|---|---|---|
| add/edit pessoa | `PESSOA` | `Adicionar pessoa` / `Editar pessoa` |
| editar range | `PERÍODO` | `Editar período da projeção` |
| editar meta | `META` | `Editar meta mensal` |
| add/edit objetivo | `OBJETIVO` | `Adicionar objetivo` / `Editar objetivo` |

Do **not** restructure the form bodies: `GoalForm` and `PersonForm` keep their
submit button inside the body, `RangeSection` and `MonthlyGoalSection` keep
theirs in the `footer` prop. The design's `Cancelar` + CTA footer was decided
out of scope during refinement.

The `▲` error lines in `GoalForm`, `MonthlyGoalSection` and `RangeSection` stay
exactly as they are — they are the repo's error idiom and rule 7(c) requires the
glyph beside the colour.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

**Prove the new test bites**: mutate `RangeTimeline`'s `done` comparison (`<=`
to `<`) and confirm `hook.test.ts` goes red before reverting.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. Run `npm run db:setup`
first — the SQLite file is gitignored and not shared across worktrees, and
without it every section 500s.

- The four cards sit in two columns at desktop and **do not stretch** to a
  common height; they stack at 375px.
- Set a 24-month range: the timeline draws 24 ticks, the solid/hatched boundary
  falls at the current month, and the caption's three numbers add up.
- Set a range that ends **before** the current month → every tick solid,
  `0 projetados`. Set one that starts **after** it → every tick hatched.
- Set a one-month range → one tick and the caption reads `1 mês`, singular.
- Clear the range → "Nenhum período definido" and **no** timeline, no caption.
- Set the monthly goal to `0`, reopen the section: it still shows `—`, not
  `R$ 0,00`, and the dashboard's Limit card still shows its empty state. That
  `0`-means-unset convention lives in two files and must stay consistent.
- Open the range modal, change nothing, and confirm `Salvar` is **disabled** —
  `MonthPicker` seeds a default on mount and only the `touched` flag stops it
  from being saved.
- Add a person, assign them a movement, then try to delete them: the 409 message
  *"Pessoa possui registros vinculados"* appears in the UI. Then delete the
  movement and delete the person successfully.
- Add, edit and delete an objective; the row shows the target and **no**
  "progresso em breve".
- Each of the four modals shows its eyebrow above its title, closes on Esc,
  closes on a backdrop click, and does **not** close on a click inside the panel.
- Both themes, no console error, no horizontal scroll on the page body at 375px.

Recorded traps: a `computer` click can report success while landing on nothing —
verify with `read_page` / `read_network_requests`; and state read in the SAME
`javascript_tool` call as the action that changed it reports the PRE-change
value. The `key` action (Backspace, End) is also unreliable on focused inputs
here — use `triple_click` + `type` to replace a `MoneyInput`'s value, and send
one character per `computer.type` call, reading the result in a separate call:
a multi-char string races the controlled re-render and compounds digits.

### Anything else you touch
No API call changes — `/api/people`, `/api/goals` and `/api/settings` keep their
request and response shapes, their Zod schemas and their error codes. No change
to `PersonForm`, `GoalForm` or their validation beyond what task 03 restyled. No
new dependency, no migration.

This is the last task of the story: after it merges, walk all five screens once
more in both themes at both widths and confirm nothing from an earlier task
regressed — that final pass is the story's Definition of Done, not this task's
alone.
