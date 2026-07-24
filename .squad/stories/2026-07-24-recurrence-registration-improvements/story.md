# Recurrence registration improvements

## Description
Three focused improvements to the "Adicionar/Editar recorrência" form
(`src/app/recorrencias/_components/RecurrencesScreen/`) and its list:

1. **Money input caret bug.** `MoneyInput` (`src/components/MoneyInput/`)
   stores integer cents and re-derives its displayed string from *all* digits
   in the field on every keystroke, but never manages the caret — so the caret
   can sit left of the comma and inserting a digit there shifts the whole value
   by a place (typing "6" then editing turns R$ 6,00 into R$ 600,00). Fix by
   pinning the caret to the far right (odometer/right-to-left entry): the field
   only ever appends, so `6` → `0,06`, `0` → `0,60`, `0` → `6,00`. The stored
   integer-cents representation is untouched — this is a DOM/caret concern only.

2. **Non-contiguous month periods.** Today a recurrence stores one contiguous
   range as two `Int` YYYYMM columns (`rangeStart`/`rangeEnd`) driven by a
   single two-thumb slider — you can't pick a single month or a split like
   Jan–Mar + Jul–Dez. Replace the single-range model with a set of active
   months, persisted in a new child table `RecurrenceMonth` (one row per active
   month). The UI keeps the existing two-thumb `MonthRangeSlider` but renders
   **several** — one per interval — with add/remove, and converts
   intervals↔months at the form boundary. Entity/API/repository speak the
   canonical `months: number[]`; only the form deals in intervals.

3. **Semantic entrada/saída colors.** The Entrada/Saída toggle renders both
   types in the same brand violet. Give income a positive (green) and expense a
   negative (red) semantic color on the toggle buttons, the section labels, and
   the amount values in the list. Tokens `--color-positive`/`--color-negative`
   already exist for both themes — reuse them, add no new token.

No dashboard/projection reads recurrences yet (those pages are stubs), so the
data-model change has no downstream consumers to break. The local `dev.db`
holds the user's 3 real recurrences (Salário, PLR, Salário) — the migration
must backfill them, not reset.

## Acceptance Criteria
- [ ] In `MoneyInput`, focusing/clicking the field places the caret at the far
      right; typing digits fills right-to-left (type `6`,`0`,`0` → `6,00`);
      there is no way to insert a digit left of the comma that shifts the
      existing value by a decimal place. Editing an existing value never
      corrupts it.
- [ ] A recurrence can be saved with a single active month.
- [ ] A recurrence can be saved with non-contiguous periods (e.g. Jan–Mar +
      Jul–Dez, skipping Apr–Jun) via multiple month-range sliders with
      add/remove; the selection round-trips through save → reload → edit intact.
- [ ] The recurrences list shows the active period as the set of intervals
      (e.g. "Jan–Mar/26 · Jul–Dez/26"), not a single arrow.
- [ ] Entrada toggle is green when selected, Saída toggle is red when selected;
      unselected stays ghost. List amounts are green for income, red for
      expense. Section labels ("Entradas"/"Saídas") carry the semantic color.
      Correct in light and dark themes.
- [ ] `npm run db:setup` applies the new migration and the 3 existing
      recurrences survive as their original contiguous interval.

## Definition of Done
- [ ] `npm run lint`, `npm run test`, and `npm run build` all green.
- [ ] `npm run db:setup` applies the `RecurrenceMonth` migration idempotently
      with the existing rows backfilled.
- [ ] All three tasks merged (each as its own PR).

## Tasks
- [x] tasks/01-money-input-caret-fix.md — pin MoneyInput caret to the right (odometer entry)
- [ ] tasks/02-semantic-entry-exit-colors.md — green/red semantic colors for entrada/saída (toggle, labels, list values)
- [ ] tasks/03-non-contiguous-month-intervals.md — RecurrenceMonth child table + multi-interval sliders end-to-end
