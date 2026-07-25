# `DashboardScreen` + the three stat cards

## Description

Replace the `src/app/page.tsx` stub (`<h1>Dashboard</h1>`) with the real
screen: it fetches `GET /api/dashboard?owner=`, handles the three payload
states and the loading/error states, lays out the card grid, and renders the
first three cards — **Entradas**, **Saídas** and **Saldo**.

Each stat card shows five numbers from its `Stats` block:

| Label | Field | Meaning |
|---|---|---|
| Valor Total | `total` | the whole global range |
| Valor Atual | `current` | range start → current month, inclusive |
| Média | `mean` | mean of the monthly effective series |
| Desvio padrão | `stdDev` | population standard deviation |
| Mediana | `median` | median of the monthly series |

The screen computes **nothing**. Task 01's endpoint already did all the
aggregation; this task fetches, formats and lays out. If you find yourself
summing or averaging in a hook, the number belongs in the API.

This task also establishes the grid that tasks 05 and 06 mount into, so both
of them touch `DashboardScreen/index.tsx` afterwards — get the layout right
here.

## When to run

- Depends on: task 01 (the endpoint, `types.ts`, `formatMoney`), task 03
  (`SectionCard`'s `hint` prop)
- Parallel-safe with: none — tasks 05 and 06 both extend this task's
  `index.tsx`, so they must follow it

## How-to

### Files

```
src/app/page.tsx                                              # edited: renders <DashboardScreen />
src/app/_components/DashboardScreen/index.tsx
src/app/_components/DashboardScreen/hook.ts
src/app/_components/DashboardScreen/style.module.scss
src/app/_components/DashboardScreen/components/StatCard/index.tsx
src/app/_components/DashboardScreen/components/StatCard/hook.ts
src/app/_components/DashboardScreen/components/StatCard/style.module.scss
```

`page.tsx` becomes three lines, exactly mirroring
`src/app/configuracoes/page.tsx`:

```tsx
import { DashboardScreen } from "./_components/DashboardScreen";

export default function Page() {
  return <DashboardScreen />;
}
```

`_components/` (route-local, not promoted) is the established convention for a
screen used by one route — see `configuracoes/_components/SettingsScreen`.
`StatCard` is rendered three times, so by the recursion rule it is a child
component in the parent's `components/` folder, with the same three-file
structure.

### The fetch, in `DashboardScreen/hook.ts`

```ts
const { profile } = useProfile();          // from "@/components/ProfileProvider/hook"
```

`AppShell` already mounts `ProfileProvider` globally (`src/app/layout.tsx`),
so the context is available — do not add another provider.

```ts
useEffect(() => {
  setData(null);
  apiGet<DashboardData>(`/api/dashboard?owner=${encodeURIComponent(profile)}`)
    .then((result) => {
      if (result.error) return setError(result.error);
      setError(undefined);
      setData(result.data ?? null);
    });
}, [profile]);
```

Three things that have burned this codebase before and are documented in
`.squad/learnings.md`:

1. **`apiGet` never rejects.** Every failure — bad body, thrown `fetch`,
   non-OK status — resolves to `{ error }`. Check `result.error` *before*
   touching `result.data`, or a failed load renders as an empty board.
2. **`profile` is `"familia"` on the first client render**, always.
   `ProfileProvider` initialises synchronously to the `FAMILY_PROFILE`
   sentinel and only reads `localStorage` in an effect, so a person-scoped
   board paints family-wide totals for one frame, then re-fetches. Keying the
   effect on `profile` handles it — do not try to defeat the extra fetch.
3. **`profile` can briefly be a deleted person's id.** `ProfileProvider`
   self-heals back to `"familia"`, but only after `/api/people` resolves, so
   the board can render all-zeros for a moment first. The effect's `profile`
   dependency picks up the correction automatically; just make sure a
   *stale* response can never overwrite a newer one — `setData(null)` at the
   top of the effect plus the `profile` key is enough at this scale, but say
   in the PR that you considered it.

Distinguish **loading** (`data === null && !error`) from **empty**. `items`
initialised to `[]` is exactly why `EntrySection` flashes its empty message on
every page load today; `PeopleSection` and `GoalsSection` use
`useState<T[] | null>(null)` to avoid that. Follow the `null` convention.

Watch the 100-line cap: if the hook grows past it once the three `Stats`
blocks are mapped into card props, extract the mapping into a
`stat-cards.helper.ts` next to the hook — pure, and therefore testable, unlike
the hook itself.

### The three payload states

`DashboardData` is a discriminated union on `status`:

- **`"no_range"`** — `rangeStart`/`rangeEnd` unset, or persisted inverted (the
  settings route's `.refine()` only validates the incoming patch, so an
  inverted range is reachable). Render one `SectionCard` with an explanation
  and a `next/link` to `/configuracoes`. Copy in the same register as the
  existing guard strings: *"Defina o período global em Configurações para
  visualizar a dashboard."*
- **`"out_of_range"`** — the current month falls outside the global range.
  Render one `SectionCard` naming both, using `formatYyyymm` from
  `@/lib/months`: *"O período global (Jan/26–Dez/28) não cobre o mês atual
  (Jul/29). Ajuste em Configurações."* — with the real values interpolated.
- **`"ok"`** — the board.

Do not render a partial board in either empty state; the owner chose a
whole-screen notice.

### `DashboardScreen/style.module.scss`

Start from the shared screen shell — `EntryScreen/style.module.scss` and
`SettingsScreen/style.module.scss` are byte-identical, so copy that
(`.screen` flex column with `gap: var(--space-6)`, `.eyebrow` heading in
`--font-display` / `--text-lg` / `--tracking-display`, `.grid`).

The existing `.grid` is 1 column → 2 at the `md` breakpoint. Nine cards of
mixed weight need more than that, and the two charts want to be wide. Extend
it here (this is the task that owns the layout):

- keep 1 column below `md`
- 2 columns at `md`, 3 at `lg` (`@include t.bp("lg")`) — the three stat cards
  then form one row on a wide screen
- add a `.wide` modifier spanning every column (`grid-column: 1 / -1`) for the
  two charts task 05 adds

`AppShell`'s `<main>` already applies `padding: var(--space-6)` and
`background: var(--color-bg)`, so the screen must not add its own page
padding.

### `StatCard`

```ts
export type StatCardProps = {
  title: string;                       // "Entradas" | "Saídas" | "Saldo"
  icon: LucideIcon;
  tone?: "positive" | "negative";
  hint: string;
  stats: Stats;
  signed?: boolean;                    // Saldo renders a sign + glyph
};
```

Reuse `SectionCard` for the shell — it gives the border, padding, title row,
icon and (from task 03) the `hint` tooltip. `StatCard` renders only the body:
a big `Valor Total`, then the other four as label/value pairs.

Icons from `lucide-react` (already a dependency). `ArrowDownCircle` /
`ArrowUpCircle` are what `EntryScreen` uses for Entradas/Saídas — reuse them
for consistency; pick something neutral like `Scale` or `Wallet` for Saldo.

**Formatting**: `formatMoney` from `@/lib/money` (task 01) — signed and
thousands-grouped. Do **not** use `formatCents` here: it applies `Math.abs`,
so a negative Saldo would render as positive.

**The Saldo card can legitimately be negative.** `src/styles/README.md` rule
7: *meaning is never colour-only — money pairs colour with a sign and a ▲/▼
glyph.* So a negative total renders `▼ −R$ 1.234,56` in `--color-negative` and
a positive one `▲ R$ 1.234,56` in `--color-positive`, matching the sanctioned
pattern in `src/styles/docs/Colors.mdx`. Mark the glyph `aria-hidden`, as the
codebase does elsewhere. Entradas/Saídas are always non-negative and take the
static `tone`.

Numbers use `--font-mono` with `font-variant-numeric: tabular-nums`
(`src/styles/README.md` rule 4) so columns of figures align. `--text-2xl` for
the headline value, `--text-sm` / `--color-text-muted` for the four secondary
labels.

### Tooltip copy

Each card's `hint` explains its own logic in one or two sentences, in
Portuguese. They must state the reconciliation rule, because it is the least
obvious thing on the screen. Something like:

> Cada mês considera o maior valor entre o que foi lançado e o que está
> previsto. Total soma todo o período global; Atual vai do início do período
> até o mês corrente.

Adapt per card (Saldo mentions entradas − saídas; Saída mentions gastos).

### No test

Vitest runs in the `node` environment — no jsdom, no `@testing-library/react`
— so components cannot be tested today, and all 16 existing test files target
pure functions. If you extract `stat-cards.helper.ts`, give it a colocated
`*.test.ts`. Otherwise state in the PR that there is no testable pure logic in
this task, rather than adding test infrastructure the story does not need.

### Verification

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

`npm install` first — this branch inherits task 01/03's `package.json` with an
empty `node_modules`, and Node's parent-directory walk-up to the main checkout
can mask a missing package until `next build` bundles. `npm run db:setup` too:
the SQLite file is gitignored and not shared across worktrees, and without it
every API call 500s as "no such table", surfacing as "Erro inesperado".

Baselines on `main` (anything beyond these is yours): `npm run lint` exit 1
with exactly 2 errors in `.design-sync/gen-cards.mjs`; `npm run test` exit 0
with the pre-existing 16 files / 95 tests plus what tasks 01–03 added;
`npx tsc --noEmit` exit 2 with exactly 1 error in
`theme.helper.test.ts(21,22)`; `npm run build` exit 0.

Biome enforces 100 lines per file and per function, 2-space indent, double
quotes, line width 80, `organizeImports` as an error, and — react domain —
`noArrayIndexKey`, so map the stat rows on a stable key, never the index.

Drive it in the browser (start the dev server from inside the worktree on a
spare port, then `preview_start` with `{url: "http://localhost:<port>"}` —
the `{name}` launcher always runs from the main checkout):

- the board loads with the real `dev.db` data and the three cards show numbers
- switch the header profile Família → a person → back: the board re-fetches
  and the numbers change
- toggle the theme: both cards legible in light and dark
- clear the global range in Configurações → the `no_range` notice replaces the
  board; restore it
- narrow the viewport to mobile: the grid collapses to one column

React state updates are async — after a synthetic click, read the resulting
DOM state in a **separate** `javascript_tool` call, or you will see the stale
pre-render value.
