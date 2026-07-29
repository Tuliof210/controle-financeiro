# What each future month already owes

## Outcome
- The second tab lists one row per month holding at least one parcel, in
  chronological order, with that month's summed parcel value and how many
  purchases compose it.
- A month with no parcel is absent from the list — including months inside the
  projection range.
- The tab honours the person selector, and an owner with no installments sees
  an empty state rather than a blank panel.

## Context

- **No new endpoint, no new fetch.** Task 04 already holds the filtered
  installment array in the screen's hook; this tab is a pure derivation from
  it, in a `*.helper.ts` beside the hook. A server round-trip here would also
  force the dashboard's `?owner=` filtering style onto a screen that filters
  client-side.

- **The aggregation, and how it differs from the existing one.**
  `src/app/api/dashboard/series.helper.ts:39-48` is the precedent for
  "sum recurrences per active month":

  ```ts
  for (const recurrence of recurrences) {
    // valueCents is PER active month — a recurrence active Jan-Dec contributes
    // its full value to each of those twelve months, never value / 12.
    for (const active of recurrence.months) {
      const month = sums.get(active);
      if (!month) continue;
  ```

  Two deliberate differences. It seeds `new Map(months.map(m => [m, emptySums()]))`
  from the global range, so every month emits a point even when empty — this
  tab seeds nothing and lets the map's keys BE the months that have parcels.
  And it clamps to the derived range with `if (!month) continue` — this tab has
  no range, so a parcel beyond the projection's end still gets a row.

- **Sort explicitly.** `GET /api/recurrences` orders by `createdAt: "asc"`
  only, and `Recurrence.months` is sorted per row but says nothing across
  rows. Sort the aggregated keys numerically — YYYYMM sorts correctly as an
  integer, which is why the format exists.

- **Reuse**: `formatYyyymm(value: number | null): string` from
  `src/lib/months.ts` for the month label (`"Ago/26"`, `"—"` on null),
  `formatMoney(cents: number): string` from `src/lib/money.ts` for the sum
  (`"R$ 1.234,56"`, U+2212 for negatives — not reachable here).

- **The row shape.** `EntryRow` does not fit: there is no entry, no owner
  chip, no edit/delete. `RowGrid` does — it is a bare
  `<ul className={styles.list}>{children}</ul>` accepting arbitrary `<li>`
  children, but its stylesheet places cells by `data-cell="who|main|amt|act"`
  attribute selectors and **a mistyped or missing tag fails silently**
  (`RowGrid/hook.ts` says so). `RowGrid/style.module.scss` is at exactly 100
  lines and `_tiers.scss` hardcodes the four-area collapse. So either emit
  `main` (month + purchase count) and `amt` (the sum) and leave `who`/`act`
  absent — confirm in the browser that the grid does not collapse without them
  — or give this tab its own simple list and stylesheet. Decide by looking, not
  by assuming.

- **Reuse** `SectionCard` (`{ title, icon?, tone?, hint?, children }`) for the
  panel and its empty state, matching how `EntrySection` frames a list.

- **Watch out for**: this is the "future invoice" view, so the sum must be the
  parcels' `valueCents`, never `totalCents` — a total belongs to the purchase,
  not to a month. And months already past still hold parcels; do not hide them
  silently, that is a product decision nobody made.

## Scope
- In: `src/app/parcelamentos/_components/InstallmentsScreen/**` — the second
  tab component and its aggregation helper.
- Out: the API, the dashboard, `src/lib/months.ts`, `RowGrid` and every other
  shared component's internals. No second fetch.

## Verify
- `npm run lint`, `npx tsc --noEmit`.
- `npm run dev`. Seed two overlapping installments for the same person — e.g.
  6x from Ago/26 and 3x from Set/26 — and check the second tab: Ago/26 shows
  one purchase, Set/26 through Out/26 show two and the exact sum of both
  parcels, Nov/26 onwards drops back to one, and no month between them is
  missing or duplicated.
- Add a third installment for a DIFFERENT person and confirm the sums change
  with the header selector.
- Delete every installment of the selected person and confirm the empty state.
- `wc -l` every touched file, stylesheets included.

## Forbidden
- A new route handler, a new service, or a second `apiGet`.
- Emitting months with a zero sum, or padding the list to the projection range.
- Summing `totalCents` into a month.
- Including `kind: "fixed"` rows — this tab is parcels only, per the story's
  scope decision.
