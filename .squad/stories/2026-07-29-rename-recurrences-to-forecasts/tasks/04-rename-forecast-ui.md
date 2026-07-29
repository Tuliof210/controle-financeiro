# Move the screen to /previsoes and rewrite its copy

## Outcome
- The nav item reads "Previsões" and leads to `/previsoes`; `/recorrencias` no
  longer exists.
- No text a user can read anywhere in the app says "recorrência",
  "recorrências" or "recorrente".
- The screen behaves exactly as before: same list, same form, same intervals,
  same coverage band.

## Context
The whole folder moves: `src/app/recorrencias/` → `src/app/previsoes/`. Files
inside that also rename (path and symbol):
- `_components/RecurrencesScreen/` → `ForecastsScreen/` (exported
  `RecurrencesScreen` → `ForecastsScreen`, and `page.tsx` renders it).
- `RecurrencesScreen/recurrence-range.helper.ts` → `forecast-range.helper.ts`
  (exports `formatMonths` — keep that name).
- `components/RecurrenceForm/` → `ForecastForm/`: `RecurrenceForm`,
  `RecurrenceFormProps`, `RecurrenceFormValues`, `useRecurrenceForm`, and
  `intervals.hook.ts`'s `useRecurrenceIntervals`.
- `CoverageBar/`, `IntervalList/`, `coverage.helper.ts`, `intervals.helper.ts`
  carry no recurrence-named symbol — only comments. Fix the comments, keep the
  names.

Two literal strings that reach the DOM:
- `RecurrenceForm/index.tsx:22` passes `idPrefix="recurrence"`, which
  `EntryForm` expands into the field ids `recurrence-name` / `recurrence-owner`
  → make it `"forecast"`.
- `IntervalList/index.tsx:20,26` build ``id={`recurrence-interval-${interval.key}-start`}``
  and `-end` → `forecast-interval-…`.
Nothing selects on either (the repo has no `data-testid` at all; e2e locates by
role and text), so this is cosmetic — but it is user-inspectable markup.

`src/components/AppShell/nav.ts:20`, today:
```ts
  { href: "/recorrencias", label: "Recorrências", icon: Repeat },
```
→ `href: "/previsoes"`, `label: "Previsões"`, `icon: TrendingUp` (swap the
`Repeat` import for `TrendingUp` from `lucide-react`; `Repeat` is used nowhere
else in the file). `isActiveNav` compares pathnames with exact equality — no
prefix logic to adjust.

**Copy.** The owner asked for a rewrite, not a word swap: these lines should say
the numbers are a forecast, not that they repeat. Current text in
`ForecastsScreen/index.tsx:14-33`, verbatim — `eyebrow: "AUTOMÁTICO"`,
`title: "Recorrências"`, `subtitle: "O que se repete todo mês — a base de toda a
projeção."`, `addTitle: "Adicionar recorrência"`, `editTitle: "Editar
recorrência"`, `deleteTitle: "Excluir recorrência"`, income `add: "Nova
recorrência"`, `emptyTitle: "Sem entradas recorrentes"`, `emptyHint: "Cadastre
salário ou renda fixa para a projeção ficar precisa."`, expense `add: "Nova
recorrência"`, `emptyTitle: "Sem saídas recorrentes"`, `emptyHint: "Aluguel,
financiamento e assinaturas entram aqui."`. Two more, in
`src/app/_components/DashboardScreen/index.tsx`:
- `:36-37` "Nenhum lançamento ainda. Registre uma movimentação ou recorrência
  para o período aparecer aqui."
- `:45-46` "… Registre uma movimentação ou recorrência nesse mês para incluí-lo."

Comments naming recurrence in shared code, to update in the same pass:
`src/components/EntryForm/index.tsx:21,26`,
`src/components/EntryForm/entry-form.helper.ts:13`,
`src/components/EntryRow/hook.ts:11,15`, `src/components/EntryRow/_meta.scss:21`,
`src/components/EntryScreen/types.ts:49,53`,
`src/components/RowGrid/style.module.scss:26,91`,
`src/lib/entry-types.ts:4`, `src/lib/months.ts:36`.

- **Watch out for** `src/components/EntryForm/index.tsx` (102 lines) and
  `RowGrid/style.module.scss` (100 lines) already sitting at the cap — rewrite
  comments without adding lines, and let `npm run lint` be the judge.
- **Watch out for** Turbopack never seeing a Sass partial created while it runs;
  no partial is created here, but a moved `.module.scss` may need a restart.
- `npm run test` stays **red** after this task (specs still use the old route
  and label) — task 05 closes it.

## Scope
- In: `src/app/recorrencias/` (moved), `src/components/AppShell/nav.ts`,
  `src/app/_components/DashboardScreen/index.tsx`, and comment-only edits in
  `src/components/EntryForm/`, `EntryRow/`, `EntryScreen/`, `RowGrid/`,
  `src/lib/`.
- Out: `src/app/api/`, `src/core/`, `src/infra/`, `prisma/`, `e2e/`.

## Verify
```bash
npm run lint
npx tsc --noEmit
npm run build
```
All clean. Then with `npm run dev` running, open `/previsoes` in the browser
pane and confirm: the nav highlights "Previsões", the list shows the migrated
rows with their interval metadata and coverage band, and creating + editing +
deleting one all work. `/recorrencias` must 404. Kill the dev server afterwards.

## Forbidden
- Adding a redirect or rewrite from `/recorrencias` — the old URL is meant to be
  gone, and `next.config.ts` has no redirects today.
- Changing layout, spacing, tokens, the form's fields, or the interval editor's
  behaviour. This task changes names and words, nothing visual beyond the text
  and the nav icon.
- Hardcoding a colour/space/radius value in any touched `.module.scss`.
