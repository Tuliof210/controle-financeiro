# The Parcelamentos screen, and the purchases tab

## Outcome
- A "Parcelamentos" entry in the sidebar and the bottom nav opens
  `/parcelamentos`, with two tabs; the second is an empty placeholder here.
- The first tab lists every `kind: "installment"` row: owner, name, monthly
  value, month range and total. Rows honour the header's person selector.
- Nothing on the bottom nav overflows or drops below 44px at 375px with seven
  items.

## Context

- **Not an `EntryScreen`.** `EntryScreen/index.tsx` hardcodes two sections
  (Entradas + Saídas) split by `type`; installments are always `expense`, so it
  would render a permanently empty Entradas card. It also owns the whole page
  layout, leaving no room for tabs. It is already 116 lines. Build
  `src/app/parcelamentos/_components/InstallmentsScreen` instead, composing the
  same parts.

- **Copy the fetch/filter idiom from `EntryScreen/hook.ts`**, not the
  component:

  ```ts
  const path = `/api/${resource}`;
  const refetch = useCallback(() => apiGet<T[]>(path).then(…), [path]);
  useEffect(() => { refetch(); apiGet<Person[]>("/api/people").then(…); }, [refetch]);
  const { income, expense } = splitByType(visibleFor(items, profile));
  ```

  Here it is one `apiGet<Recurrence[]>("/api/recurrences")`, then
  `visibleFor(items, profile).filter((r) => r.kind === "installment")`.
  `visibleFor` and `FAMILY_PROFILE` are in `src/lib/ownership.ts`; `profile`
  comes from `useProfile()` (`src/components/ProfileProvider`). One fetch feeds
  both tabs — task 06 reads the same array.

- **Reuse the row.** `EntryRow` already renders four of the five columns:
  `entry.name`, the owner chip + name in its meta line, `formatMoney(entry
  .valueCents)` in the amount cell, and a free-form `period` ReactNode. Its
  props, verbatim (`src/components/EntryRow/hook.ts`):

  ```ts
  export type EntryRowProps = {
    entry: Entry; person?: Person; period: ReactNode; band?: ReactNode;
    onEdit: () => void; onDelete: () => void;
  };
  ```

  The total rides in `period`: `Ago/26–Jan/27 · 6x · total R$ 2.999,00`, built
  from `formatMonths(months)` and `formatMoney(totalCents)`. Do NOT add a fifth
  `data-cell` — `RowGrid`'s grid is `grid-template-areas: "who main amt act"`,
  its stylesheet is at exactly 100 lines, and `_tiers.scss` hardcodes two
  container-query collapses over that same four-area set.

- **Promote `formatMonths`.** It is route-local at
  `src/app/recorrencias/_components/RecurrencesScreen/recurrence-range.helper.ts`
  and produces `"Jan/26–Mar/26 · Jul/26–Dez/26"` (EN DASH U+2013, `" · "`
  joiner) from `monthsToIntervals` + `formatYyyymm`. A second consumer triggers
  the Promotion rule: move it to `src/lib/`, and `monthsToIntervals`/`Interval`
  with it if the import chain into `RecurrenceForm/intervals.helper.ts` would
  otherwise point from `lib/` into a route folder.

- **Nav.** `src/components/AppShell/nav.ts` holds one `NAV: NavEntry[]` with
  `{ href, label, short, icon }`, `icon` from `lucide-react`. The rail shows
  `label`; `BottomNav` shows `short` and uses `label` as `aria-label`. Its
  comment states the constraint measured at six items: *"`short` is the
  bottom-nav label — the full ones do not fit in a sixth of 375px"*. This makes
  seven, ~53px each — measure, do not assume. `isActiveNav` is exact equality,
  so `/parcelamentos` needs no change there.

- **Verify the nav width in the browser**, at 375px: `resize_window` to mobile,
  then read each item's `getBoundingClientRect()` and computed font-size. If a
  `short` of "Parcelas" overflows, shorten it — do not shrink the shared type
  scale or the 44px target.

- **Watch out for**: `src/lib/api.ts`'s helpers never reject — guard
  `if (result.error || !result.data)`, per `DashboardScreen/hook.ts:39-41`.
  `EntryScreen`'s weaker `setItems(result.data ?? [])` is fine for a list only.
  And Turbopack will not see a `.module.scss` created while `npm run dev` runs:
  `touch` it.

## Scope
- In: `src/app/parcelamentos/page.tsx` (a couple of lines, per the Next-special
  -files rule) plus `_components/InstallmentsScreen/**`,
  `src/components/AppShell/nav.ts`, and the `formatMonths` promotion into
  `src/lib/` with `RecurrencesScreen`'s import updated.
- Out: any modal, form or mutation — task 05. The aggregation itself — task 06.
  `EntryScreen`, `EntryRow`, `RowGrid` and their stylesheets: consumed
  unchanged.

## Verify
- `npm run lint`, `npx tsc --noEmit`.
- `npm run dev`, POST two installments for two different people via
  `/api/recurrences`, then open `/parcelamentos`: both rows render with all
  five facts, and switching the header person selector narrows the list.
- At 375px, confirm all seven bottom-nav items are visible, none clipped, each
  still ≥44px tall.
- `wc -l` every touched file, stylesheets included — Biome scores the 100-line
  rule as `info`, so `npm run lint` will not catch it for you.

## Forbidden
- Rendering `EntryScreen` on this route, or adding a "single section" mode to
  it.
- A new `data-cell` tag or new grid areas in `RowGrid`.
- A new API endpoint or a `?kind=` query param — one `GET /api/recurrences`,
  filtered on the client.
- Server-side owner filtering here; this screen follows the client-side
  `visibleFor` precedent, not the dashboard's `?owner=`.
