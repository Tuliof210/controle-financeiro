# Derived Global Period

## Why
The projection period is typed by hand in Configurações and every form clamps to
it, so registering anything outside means editing Settings first — and an entry
that falls out of the window silently stops counting. The period should follow
the data instead of the data asking permission from the period.

## Acceptance Criteria
- [ ] Configurações no longer has a "Período da projeção" card
- [ ] The period is the oldest→newest month across every recurrence month and
      movement month; registering an earlier or later entry widens it at once
- [ ] A recurrence interval is a start/end pair of month+year pickers, one pair
      per interval, add/remove interval intact; years run 2000 to 2099
- [ ] A movement's month is one month+year picker, same 2000–2099 years
- [ ] Both forms save any month in that domain, including on an empty database,
      with no "defina o período" guard and no clamping
- [ ] The home's two charts show 12 months at a time on desktop and 6 on mobile,
      anchored at the oldest, the rest reachable by sideways scroll inside the
      card, with the Y axis staying visible
- [ ] On mobile the Y tick labels read thousands as "K"
- [ ] When the derived period misses the current month the dashboard still says
      so, pointing at the entries instead of at Configurações

## Definition of Done
- [ ] `npm run lint`, `npm run test` and `npm run build` green
- [ ] Manual, on a scratch copy of the SQLite file: starting empty, register a
      movement in Jan/2005 and one in Dez/2040 and confirm the dashboard covers
      exactly that span
- [ ] Manual: at 375px and at 1280px, scroll both home charts end to end and
      confirm the Y axis stays on screen and the page never scrolls sideways

## Tasks
- [x] tasks/01-derive-global-period.md — the period follows the entries, both
      forms get free month+year pickers, the Configurações card is deleted
- [ ] tasks/02-chart-month-window.md — 12/6-month window, inner horizontal
      scroll, pinned Y axis, "K" tick labels on mobile
- [x] tasks/03-drop-settings-range-columns.md — the migration that removes the
      by-then unread rangeStart/rangeEnd columns
