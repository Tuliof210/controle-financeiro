# Generic EntryRow / EntrySection / EntryScreen (Phase 2)

## Description
Unify the near-identical **display + orchestration** components of the
recurrences and movements features into generics reused by both. The audit
confirmed these pairs are line-for-line equivalent except entity naming, the
three API path strings, and one genuine domain difference (the period cell).

> **Phase 2 caveat (read before starting).** The audit recommends caution on
> the component abstraction: with only two entities this is a premature-
> abstraction risk, and the *Form's* period control genuinely diverges (that's
> task 05). Row/Section/Screen are the *safer* part of Phase 2 — their only real
> divergence is Row's period cell. If the owner elects to stop after Phase 1,
> skip this task. It is behavior-preserving; ship only if the generics read
> cleaner than the duplication they replace.

Duplicated pairs (all on `main`, byte-equivalent modulo `Recurrence`↔`Movement`
naming, route strings, and PT labels):
- Screen `index.tsx` + `hook.ts`: `RecurrencesScreen` ↔ `MovementsScreen`
- Section `index.tsx` + `hook.ts`: `RecurrenceSection` ↔ `MovementSection`
- Row `index.tsx`: `RecurrenceRow` ↔ `MovementRow`
- All four `*/style.module.scss` pairs are **byte-identical** (verified via diff).

The one real difference: the Row's period cell — recurrence renders
`formatMonths(recurrence.months)`, movement renders `formatYyyymm(movement.month)`.

## When to run
- Depends on: 01, 02, 03 (uses `EntryType`, `@/lib/months`, `@/lib/ownership`).
  Branch from main after 03 merges.
- Parallel-safe with: none (task 05 builds on this)

## How-to
Build three generic components under `src/components/` (shared home; each keeps
the repo's index/hook/style split), each parameterized over an
`Entry = { id: string; name: string; valueCents: number; type: EntryType;
ownerId: string }` base. Then reduce the two features to thin call sites.

- **`EntryRow`** — generic over `T extends Entry`. Props:
  `{ entry: T; person?: Person; period: ReactNode; onEdit; onDelete }`. Renders
  the existing shared JSX (swatch/owner/name/value colored by `styles[entry.type]`
  /period/edit/delete). The caller passes the already-formatted `period` node —
  recurrences pass `formatMonths(r.months)`, movements pass `formatYyyymm(m.month)`.
  Move `RecurrenceRow/style.module.scss` (identical to the movement one) in as
  the shared style; delete both feature row folders.
- **`EntrySection`** — generic over `T extends Entry`. Props mirror
  `RecurrenceSectionProps` (`title, icon, tone, items: T[], people, onAdd,
  onEdit, onDelete`) plus `renderPeriod: (item: T) => ReactNode` so the section
  can build each row's period node. Its hook keeps the `items.map(... person:
  people.find(p => p.id === item.ownerId) ...)` row builder. Delete both feature
  section folders.
- **`EntryScreen`** — generic over `T extends Entry`. A `useEntryScreen<T>`
  hook takes the entity-specific config: `{ resource: string /* "recurrences" |
  "movements" */, labels: { heading, addTitle, editTitle, deleteTitle, empty },
  renderPeriod, FormComponent }`. It holds the shared machinery verbatim from the
  current screen hooks: the `ModalState` union, the triple fetch (`/api/${resource}`,
  `/api/people`, `/api/settings`), `openAdd/openEdit/openDelete/close`, `persist`,
  `onAdd`/`onUpdate`/`onConfirmDelete` (using `` `/api/${resource}` ``), the
  `visibleFor`/`splitByType` split (now from `@/lib/ownership`), and the `period`
  derivation from settings. The index renders the `h1`, two `EntrySection`s, the
  add/edit `Modal`s rendering `FormComponent`, and the `ConfirmDialog`.
  - **Follow the `@/lib/api` never-rejects contract** — check `result.error`
    before `result.data` (do not wrap in try/catch), exactly as the current
    hooks do.
  - Reuse the existing `Modal`/`ConfirmDialog`/`SectionCard`/`Button` as-is.
- **Thin the features:** `src/app/recorrencias/_components/RecurrencesScreen`
  and `.../MovementsScreen` collapse to a small wrapper that calls
  `EntryScreen` with their config (`resource`, labels, `renderPeriod`, and their
  `RecurrenceForm`/`MovementForm` — still entity-specific until task 05). The
  `page.tsx` files are unchanged.

Watch the 100-line Biome cap on the generic hook (the screen hook is ~97 lines
today; a generic version with injected config should still fit — extract a
`*.helper.ts` if it doesn't).

## Risks / notes
- Behavior must be identical: the only user-visible strings are the injected
  labels, and the only structural difference is `renderPeriod`. Diff the rendered
  screens against `main` (they must match exactly).
- If the generic version ends up *longer or less readable* than the duplication,
  that is a signal the abstraction isn't paying off at two consumers — say so in
  the PR and consider deferring per the caveat above.

## Verification
```
npm run lint
npm run test
npm run build
```
All green. Live (`npm run dev`): both `/recorrencias` and `/movimentacoes` behave
exactly as before — two colored sections, owner filtering, add/edit/delete
modals, correct period text (multi-month intervals vs single "Ago/26"). Take a
before/after look to confirm zero visual change.
