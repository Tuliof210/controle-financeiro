# EntryScreen under the 100-line cap

## Outcome
- `src/components/EntryScreen/index.tsx` is at or under 100 lines.
- Both feature screens that mount it (`/recorrencias`, `/movimentacoes`) render
  identically — this is a pure structural split.
- Closes `.squad/debt.md:30`.

## Context

**The file is 116 lines and Biome does not flag it.** Proven:
```
$ npx biome check --diagnostic-level=info src/components/EntryScreen/index.tsx
Checked 1 file in 2ms. No fixes applied.   (exit 0)
```
The rule *is* wired and *does* fire elsewhere (`.design-sync/gen-cards.mjs:3:1
lint/style/noExcessiveLinesPerFile — This file has too many lines (157)`), but
Biome's count is not `wc -l` and does not fire here. **`wc -l` is the check for
this task**, per `.squad/learnings.md`. Nothing will go red on its own.

**The two seams, both already sanctioned by the recursion rule.**

Seam 1 — the two `<EntrySection>` blocks (lines 26-56, 31 lines). Identical except
`title` (`"Entradas"`/`"Saídas"`), `icon` (`ArrowDownCircle`/`ArrowUpCircle`),
`tone` (`"positive"`/`"negative"`), `items` (`income`/`expense`), `labels`
(`labels.income`/`labels.expense`) and the `openAdd` argument. Threaded
identically to both: `people`, `period`, `renderPeriod`, `renderBand`, `onEdit`,
`onDelete`.

Seam 2 — the two `<Modal>` blocks (lines 58-84, 27 lines). Differ in
`modal.type === "add"`/`"edit"`, `labels.addTitle`/`labels.editTitle`,
`initial={{ type: modal.kind }}`/`initial={modal.entry}`, `onSubmit`, and
`submitLabel`. `error` and `people` are identical in both.

**Reuse — the render-prop contract a split must carry through**, from
`src/components/EntryScreen/types.ts`:
```ts
  renderPeriod: (item: T, period: Period | null) => ReactNode;
  // The band under the row, when the entity has one. A second slot rather than
  // one that returns both halves: they land in different grid areas, and
  // Movimentações has no band at all, so it simply never passes this.
  renderBand?: (item: T, period: Period | null) => ReactNode;
  Form: ComponentType<EntryFormSlotProps<V>>;
```
Note `renderPeriod`, `renderBand` and `Form` are destructured from `config`, not
from the hook (`index.tsx:16`) — `hook.ts` never sees them. Any child needs
`config`'s render props **plus** hook values.

**`hook.ts` has nothing left to absorb.** At 85 lines it already owns all state
and I/O: `items`, `people`, `period`, `modal`, `error`, `refetch` + mount effect,
`splitByType(visibleFor(items, profile))`, the five modal openers, and
`persist`/`onAdd`/`onUpdate`/`onConfirmDelete`. It returns exactly the 14 names
`index.tsx` destructures. The 16 excess lines are pure JSX repetition — pushing
them into the hook is not available.

**Imitate** the sibling-child pattern the repo already uses at depth, e.g.
`src/components/AppShell/components/Header/` (own `index.tsx`, `hook.ts`,
`style.module.scss`, plus `greeting.helper.ts` and `today.helper.ts`).

- **Watch out for** `types.ts` — `EntryScreen/` is already a four-file folder, and
  `EntryScreenLabels`'s comment names this exact problem:
  > One object rather than three flat fields: it spreads straight into
  > `<PageHeader>` and keeps EntryScreen/index.tsx at its current line count,
  > which sits right on the 100-line cap.
- **Watch out for** a `*.helper.ts` being the wrong tool here: helpers in this repo
  are `.ts` and hold no JSX. The seams want a child component, not a helper.
- **Watch out for** the `ConfirmDialog`'s `error` slot at the foot of the file —
  its comment explains a real behaviour (a rejected delete leaves the dialog open
  and `Excluir` would otherwise read as dead). It must survive the split.
- **Verify with** `wc -l`, `npm run lint`, `npx tsc --noEmit`, `npm run test:e2e`.

## Scope
- In: `src/components/EntryScreen/` — `index.tsx`, a new `components/` child (or
  children) inside it, `types.ts` if a child's props need naming.
- Out: `src/components/EntryScreen/hook.ts` — no logic moves. `EntrySection`,
  `Modal`, `ConfirmDialog`, `PageHeader`. The two feature screens under
  `src/app/recorrencias/` and `src/app/movimentacoes/`.

## Verify
```
wc -l src/components/EntryScreen/index.tsx src/components/EntryScreen/components/*/*.tsx
npm run lint
npx tsc --noEmit
npm run test:e2e
```
Every file the split produces must also be at or under 100 lines — a split that
just moves the overage is not done. `npm run test:e2e` covers both consumers:
`row-columns`, `row-overflow` and `row-hit-target` all drive `/recorrencias` and
`/movimentacoes`.

## Forbidden
- Do not change rendered output. If a single pixel or DOM node differs, this went
  beyond a split.
- Do not turn the generic away: the component is
  `EntryScreen<T extends Entry, V extends { type: EntryType }>` and children must
  stay type-safe over `T`/`V` without an `any` or a cast.
- Do not collapse `renderPeriod` and `renderBand` into one slot.
- Do not add a barrel file.
