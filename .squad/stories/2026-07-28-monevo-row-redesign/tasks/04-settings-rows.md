# Pessoas and Objetivos onto the same row anatomy

## Outcome
- A Pessoas row and an Objetivos row lay themselves out with the same grid areas,
  spacing, hover and buttons as a Movimentações row — no shared columns left
  anywhere in the app.
- An Objetivos row's name starts at the card's left edge, with no empty indent
  where a chip would be.
- Both lists survive the same width sweep the entry rows do: name readable, both
  buttons inside the row, no sideways scroll.

## Context
The design's Configurações rows (`Monevo.dc.html`) are the entry row minus the
metadata line, and they keep the smaller dot rather than adopting the 26px chip:

```html
<!-- PESSOAS -->
<div style="display:flex;align-items:center;gap:var(--space-3);
  padding:var(--space-4) var(--space-2);
  border-bottom:var(--border-1) solid var(--c-line)" style-hover="background:var(--c-raised)">
  <span style="{{ p.dot }}"></span>          <!-- width:14px;height:14px;--radius-sm -->
  <span style="font-size:var(--text-base);flex:1">{{ p.name }}</span>
  … edit … delete …
<!-- OBJETIVOS -->
  <span style="font-size:var(--text-base);flex:1;min-width:0;overflow:hidden;
    text-overflow:ellipsis;white-space:nowrap">{{ g.name }}</span>
  <span style="font-size:var(--text-sm);font-variant-numeric:tabular-nums">{{ g.target }}</span>
  … edit …
```

Two deliberate deviations from the mock, already decided with the owner:
- The design shows a **role** beside each person and a **% badge** beside each
  goal. `Person` is `{ id, name, color, createdAt }` and `Goal` is
  `{ id, name, targetCents, createdAt }` — neither field exists and neither is in
  this story's scope. Render neither.
- The design's goal row has **only an edit button**. Keep the delete button;
  removing a working action is a regression, not a redesign.

- **Imitate task 02's EntryRow** — the area names, the padding, the hover, the
  divider, `--icon-btn-size`, and the container-query tiers all come from there
  rather than being re-invented. What differs is only which areas each row fills:
  a person has a dot and no amount, a goal has an amount and no dot.
- **Both rows already share an idiom worth keeping**, stated once in
  `PersonRow/style.module.scss` and referenced from `GoalRow`'s:
  ```scss
  .row { padding: var(--space-4) var(--space-2);
         border-bottom: var(--border-1) solid var(--color-border-subtle); … }
  // No trailing rule directly above the dashed "Adicionar pessoa" button.
  &:last-child { border-bottom: 0; }
  ```
  The dashed add button is a sibling *outside* the `<ul>`, which is why that
  `:last-child` rule exists. Keep it.
- **`GoalRow` has no `@use "swatch-colors"`** and needs none — it has no dot.
  With task 02's `who` track sized `auto`, its name starts at the row's edge for
  free.
- **The name keeps ellipsis, not wrapping**, with the same three requirements
  task 02 lists (`overflow: hidden` on the name element only, `display: block`,
  `min-width: 0` on its wrapper). Today both files carry
  `overflow-wrap: anywhere` with the note that *"an 80-char goal name needs no
  spaces to be legal"* — that reasoning is why the ellipsis path must actually
  work, not why wrapping must survive.
- **`PersonRow` is the only `bare` list in the e2e** (`e2e/row.helper.ts`:
  `{ path: "/configuracoes", long: LONG_PERSON_NAME, short: SHORT_PERSON, bare: true }`),
  and it is the list that asserts the gutter as a floor *and* a ceiling:
  ```ts
  const gap = cells.edit.x - (cells.name.x + cells.name.width);
  expect(gap).toBeLessThan(GUTTER + 1);
  expect(gap).toBeGreaterThan(GUTTER - 1);
  ```
  So a Pessoas row is where a wrong column gap shows up first.
- **148px is this task's worst case, and it is not the narrowest viewport.**
  `row-columns.spec.ts` records it: at a 768px viewport the two-column
  Configurações grid has kicked in but the window has not grown to pay for it, so
  a row gets 148px — narrower than the 291px the same row gets at 375px. That is
  the width the third collapse tier from task 02 exists for; confirm it fires
  here, since the entry lists never get that narrow.
- **`SettingsScreen/style.module.scss` has the same `.grid` container-query
  split as `EntryScreen`'s** — if task 02 moved that constant, this screen's
  needs the same treatment, and it is the screen that produces the 148px row.
- **An open debt entry to close here**: `row-columns.spec.ts`'s
  `keeps its controls together` loops `[WIDE, NARROW]` and skips `PINCHED`
  (768px) — *"the mode with the most special-casing … has no assertion that the
  two buttons are still side by side"*. Add `PINCHED` to that loop. The spec is
  96 lines against a 100-line cap, so budget for it.

## Scope
- In: `src/app/configuracoes/_components/SettingsScreen/components/PeopleSection/**`,
  `.../GoalsSection/**`, `SettingsScreen/style.module.scss`,
  `e2e/row-columns.spec.ts`.
- Out: the `Person`/`Goal` entities, their API routes, their forms and any
  migration. Nothing under `src/core/`, `src/infra/` or `src/app/api/`.

## Verify
- `npm run lint`, then `wc -l` every touched file.
- `npm run test` — no `next dev` running in this directory. All four LISTS must
  be green, not just the two Configurações ones.
- Browser preview `/configuracoes` at 1440 / 768 / 375 px in both themes.
  768px is the one that matters most: read the actual rendered row width in the
  console and confirm which collapse tier is active at it.
- Delete every person and every goal and confirm the empty `<p>` still renders
  and the dashed add button still sits flush under the list.

## Forbidden
- Adding a field to `Person` or `Goal`, or any migration.
- Removing the delete button from a goal or a person row.
- Re-declaring the row's grid, padding, hover or button sizing locally instead of
  sharing task 02's — two rows drifting apart is the thing this task removes.
