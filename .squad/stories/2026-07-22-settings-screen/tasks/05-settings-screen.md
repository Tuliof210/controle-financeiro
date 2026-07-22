# Settings screen — /configuracoes wired to the APIs

## Description
Assemble the actual **Configurações** screen: replace the bare `<h1>` in
`src/app/configuracoes/page.tsx` with a rich, DS-driven layout of four
sections — Pessoas, Range, Meta mensal, Objetivos — each fetching and mutating
its Route Handler (task 02) and composing the shared primitives (tasks 03,
04). Design must **not be simplório**: lean on the DS foundations (angular
contained surfaces, vivid accents, pixel display face for eyebrows, mono +
`tabular-nums` for numbers, real empty states, focus rings, reduced-motion).

## When to run
- Depends on: 02-settings-api, 03-money-input, 04-form-primitives
- Parallel-safe with: none (integration layer)

## How-to
> **Worktree note (for /ps:run):** dependencies added `zod` and a Prisma
> `postinstall`. Run `npm install` at the start so the generated client + zod
> are present, or `next build` fails.

Follow `.squad/ARCHITECTURE.md`: `page.tsx` stays a couple of lines rendering
a real component in a route-local `_components/` folder; that component and
its children follow the three-file structure. Sections are route-local
(used only here) so they live under `_components/`, not `src/components/`.

**Structure**:
```
src/app/configuracoes/
  page.tsx                                  # thin: renders <SettingsScreen/>
  _components/SettingsScreen/               # index.tsx + hook.ts + style.module.scss
    components/
      SectionCard/                          # reused angular surface wrapper (title + body)
      PeopleSection/
      RangeSection/
      MonthlyGoalSection/
      GoalsSection/
```

- **`page.tsx`**: `export default function Page() { return <SettingsScreen /> }`
  (add `import`). Optionally set the route's page title via `<h1>` inside
  SettingsScreen, not here.

- **`SettingsScreen`** (`"use client"`): a page header with a display-face
  eyebrow ("CONFIGURAÇÕES", `--font-display`, `--text-lg`, tokens) and the
  four sections laid out in a responsive grid — two columns on `@include
  t.bp("md")`, single column below. Uses `--space-*` gaps, `--color-bg`
  canvas. `hook.ts` holds no cross-section state (each section owns its data);
  keep it minimal or omit logic beyond layout flags.

- **`SectionCard`** — the repeated angular surface (appears 4×, so it's a
  child component per the recursion rule): `--color-surface` bg, `--border-2`
  `--color-border`, `--radius-lg` (≤6px), `--space-6` padding, a title row
  (mono, `--weight-bold`, maybe a lucide icon via `lucide-react` like the nav
  uses) + a `children` body slot. Props `{ title: string; icon?: LucideIcon;
  children: ReactNode }`.

Each section is a `"use client"` three-file component. **Data**: plain
`fetch` in `hook.ts` — `useEffect` to load on mount, handlers to mutate then
refetch (or optimistic local update). `// ponytail: plain fetch + useState; add
SWR/react-query only if refetch churn becomes a problem.` All endpoints return
the `{ data }` / `{ error: { message, code } }` envelope — read `data` on ok,
surface `error.message` on failure.

- **`PeopleSection`** (`/api/people`):
  - Loads the list; renders each person as a row/chip: a square color swatch
    (the person's `color` → matching `--<key>-400` token, same mapping as
    `ColorPicker`), the name (mono), and a delete `Button variant="danger"`
    (calls `DELETE /api/people?id=<id>` then refetch).
  - Add form: `TextField` (name) + `ColorPicker` (color, default first
    palette key) + `Button variant="primary"` "Adicionar". POST, then clear +
    refetch. On `409 duplicate`, show `error.message` under the field (via
    `TextField`'s `error` prop).
  - Empty state: a muted "Nenhuma pessoa cadastrada ainda." line (not just
    blank), styled with `--color-text-muted`.

- **`RangeSection`** (`/api/settings`):
  - Loads settings; two `MonthPicker`s (Início / Fim) seeded from
    `rangeStart` / `rangeEnd`. A "Salvar" `Button` PUTs
    `{ rangeStart, rangeEnd }` together. On the `422` "Fim não pode ser antes
    do Início", show the message inline (near the Fim picker). On success show
    a brief "Salvo" confirmation.
  - A readable summary line: `formatYyyymm(rangeStart) + " → " +
    formatYyyymm(rangeEnd)` → e.g. "Jan/25 → Ago/28" (share the month labels
    with `MonthPicker`; a tiny `range.helper.ts` formatting `YYYYMM → "Ago/28"`
    keeps `hook.ts` under the cap). Muted placeholder when unset.

- **`MonthlyGoalSection`** (`/api/settings`):
  - Loads `monthlyGoalCents`; a single `MoneyInput` (task 03) bound to it +
    "Salvar" `Button` that PUTs `{ monthlyGoalCents }`. Reloads correctly on
    refresh. Brief "Salvo" confirmation on success.

- **`GoalsSection`** (`/api/goals`):
  - Loads the list; each goal row: name (mono) + target money rendered with
    `formatCents` from `MoneyInput`'s `money.helper.ts` prefixed `R$`,
    `tabular-nums` + `--color-text` — plus a delete `Button variant="danger"`.
    Leave a visible placeholder slot for future progress (e.g. a muted "—
    progresso em breve") so the layout anticipates it without building it.
  - Add form: `TextField` (name) + `MoneyInput` (target) + `Button` "Adicionar".
    POST `{ name, targetCents }` (reject client-side if `targetCents < 1`),
    clear + refetch.
  - Empty state: muted "Nenhum objetivo cadastrado ainda."

**Design rules to honor** (from `src/styles/README.md`): every number in mono
+ `tabular-nums`; short titles/eyebrows may use `--font-display`, never body;
radius ≤ `--radius-lg`; elevation border-first (no offset shadows); every
interactive element a focus ring; money pairs color with the `R$`/value (not
color-only); reduced-motion already handled at the token layer. Verify both
light and dark via the header `ThemeToggle`. Keep every file ≤100 lines
(split sections' add-forms into their own child components if a `hook.ts`
grows past the cap — the recursion rule expects it).

## Verification
- `npm run lint` — Biome all-green (nothing over 100 lines).
- `npm run test` — unchanged suites still pass.
- `npm run build` — the route compiles.
- **End-to-end via dev server** (`npm run dev`, open `/configuracoes`):
  add a person (name + color) → appears in the list; add a duplicate → inline
  error; delete → gone. Set Início/Fim and save → summary reads e.g. "Jan/25
  → Ago/28"; set Fim before Início → inline error. Type a Meta mensal (only
  digits register, `,`/pad from mask) and save. Add an objetivo with a target
  → shows `R$` + `tabular-nums`; delete it. **Reload the page** → every value
  persisted. Toggle dark mode → all four sections read correctly with focus
  rings intact.
