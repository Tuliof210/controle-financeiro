# Move the Configurações rows onto the shared row primitive

## Outcome
- Pessoas and Objetivos render through the same row primitive as the entry screens,
  with the same primary/secondary tiers and the same non-separating action cluster.
- The inline `<li>` living inside `GoalsSection/index.tsx` is its own component
  folder, and that file drops back under the 100-line cap it exceeds today.
- `/configuracoes` does not scroll horizontally at 375px, 768px or 1024px.

## Independently shippable
yes

## Scope
- In: `src/app/configuracoes/_components/SettingsScreen/components/PeopleSection/**`,
  `src/app/configuracoes/_components/SettingsScreen/components/GoalsSection/**`,
  `e2e/`
- Out: `src/components/EntryRow/` and the row primitive itself — if either needs a
  change to fit these rows, the primitive's seam is wrong and that is worth raising,
  not a licence to fork it. Also out: `MonthlyGoalSection` (it has no rows),
  `PersonForm`, `GoalForm`, `ColorPicker`.
- Imitate: how task 01 wired `EntryRow` to the primitive — same slot names, same split
  of responsibility, where the primitive owns the row's internals and the list keeps
  owning its own dividers and spacing
- Reuse: the row primitive and the spec helper task 01 added; `IconButton`;
  `src/styles/_swatch-colors.scss` for the person dot

## When to run
- Depends on: 01
- Parallel-safe with: none

## Verify
- `npm run test` — extend the existing spec to `/configuracoes` at the same widths,
  and assert both action buttons stay on the same row as the item they act on.
- `npm run lint` && `npm run build`.
- `wc -l` on `GoalsSection/index.tsx` and every other file you created or touched.
- Check the diff against `src/styles/README.md` rules 1, 3, 4 and 7.

## Forbidden
- Do not add `gap` to the Pessoas or Objetivos lists. Their structure is a continuous
  run of `border-bottom` dividers with the last one removed; a gap breaks that run
  into floating lines. The entry lists use the opposite idiom on purpose — do not
  merge the two.
- Do not drop the `<ul>`/`<li>` semantics, `key={person.id}` / `key={goal.id}`, or the
  per-row `aria-label`s that name the person or goal. The modal returns focus to the
  triggering button, so a re-keyed row drops focus to `<body>` on close.
- Do not shrink `IconButton` below 44px.
