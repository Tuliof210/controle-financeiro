# Installment purchases get a screen of their own

## Why
A 6x purchase is not a recurrence. Registering one today means dividing the
price by hand and then dropping a short-lived row into the list meant for
salary and financing — a few purchases later that list is unreadable. And
nothing answers "how much does Out/26 already owe?".

## Acceptance Criteria
- [ ] A "Parcelamentos" item in the sidebar and bottom nav opens
      `/parcelamentos`, a screen with two tabs.
- [ ] Registering "Sofá", total R$ 2.999,00, 6 parcels, first one Ago/26 needs
      no manual division: the row reads owner, name, R$ 499,84 per month,
      Ago/26–Jan/27 and the R$ 2.999,00 total.
- [ ] That entry is absent from `/recorrencias`, which still lists salary and
      financing — yet each of those six months' projected expense on the
      dashboard rises by R$ 499,84. Hiding it moved no dashboard number.
- [ ] The second tab has one row per month holding at least one parcel, in
      order: the summed value and how many purchases compose it. A month with
      no parcel is absent.
- [ ] Both tabs honour the person selector.
- [ ] Editing that entry down to 3 parcels rewrites its months to
      Ago/26–Out/26 and its monthly value; deleting it empties both tabs.

## Definition of Done
- [ ] `npm run lint` exits 0 with no new `noExcessiveLinesPerFile` info
- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run test` green — with no `next dev` running in this directory
- [ ] The new spec is proven non-vacuous: replacing the parcel division with
      the raw total must turn it red

## Tasks
- [x] tasks/01-kind-and-total.md — `kind` + `totalCents` through the stack
- [x] tasks/02-fixed-only-recurrences.md — `/recorrencias` shows only `fixed`
- [x] tasks/03-promote-tabbar.md — TabBar moves to `src/components`
- [x] tasks/04-installments-screen.md — nav, route, tabs and the purchase list
- [x] tasks/05-installment-form.md — total + parcel count in, CRUD out
- [ ] tasks/06-month-aggregator.md — the second tab, one row per month
- [ ] tasks/07-installments-e2e.md — the spec, on its own fixture
