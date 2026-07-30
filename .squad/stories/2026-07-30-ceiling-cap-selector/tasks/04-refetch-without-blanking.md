# A cap change revalidates in place

## Outcome
- Clicking a cap segment leaves the board mounted: the charts, the KPI cards, the
  savings banner and the segmented control itself stay on screen while the new
  payload arrives, then the figures update.
- An expanded month table stays expanded across a cap change.
- The very first load of the screen is unchanged — still the "Carregando" notice,
  not an empty board.
- Switching profile still works, and a slow response for a cap or profile the
  user has already moved off never lands.

## Context

**The whole problem is one line.** `DashboardScreen/hook.ts`'s effect opens with
`setData(null); setError(undefined);` and the screen derives
`loading: data === null && error === undefined`, rendering
`{loading ? <Notice title="Carregando" …> : null}` and
`{data?.status === "ok" ? <Board data={data} /> : null}`. So `null` is doing two
jobs — "never loaded" and "loading right now" — and only the first one needs it.

**Why the collapse is worse than a flicker.** `Board` renders `Overview` (two
charts plus three KPI cards), `CeilingCard` and `SavingsSection`. `Overview` reads
`data.points`, `data.income/expense/balance` — every one of them cap-invariant, so
it is unmounted and rebuilt for nothing. `useShowAll`'s `all` flag lives inside
`CeilingCard`, so a 30-row table the user just expanded collapses back to 8 on
every cap click, and the button that was clicked disappears from under the cursor.

**What must not regress.** The race guard is already correct and stays:
```
let current = true;
… if (!current) return; …
return () => { current = false; };
```
So serving the last-good `data` while a request is in flight is safe — an
out-of-order response still cannot land. Keep the two guards the effect's comments
justify: `apiGet` never rejects, and it resolves `{ data: undefined }` for a 2xx
with no body, so `if (result.error || !result.data)` must survive intact —
`?? null` alone is not a substitute.

**Keep the fix inside `DashboardScreen`.** The distinction wanted is
"never loaded" vs "refreshing"; a second boolean beside `data` expresses it
without a library. Do not reach for SWR/React Query, and do not use
`useTransition` to paper over it — the fetch is not a transition-driven render.

**Error path.** Today an error replaces the board. After the change, decide it
explicitly: a failed refetch should not silently leave stale figures looking
current. Surfacing the error while keeping the stale board is acceptable; showing
neither is not.

**Line budget.** `DashboardScreen/hook.ts` is 51 lines and heavily commented —
there is room, but the comments explaining `null`-as-sentinel now describe the
old behaviour and must be rewritten, not appended to.

## Scope
- In: `src/app/_components/DashboardScreen/hook.ts` and `index.tsx`.
- Out: every other file. If the fix needs a change outside these two, the wrong
  thing is being fixed.

## Verify
- `npm run lint`, `npm run build`, `npm test`.
- In the browser preview, with the network throttled: expand the month table,
  click 25%, and confirm the board never unmounts, the page does not scroll-jump,
  and the table is still expanded when the new figures land.
- Hard-reload and confirm the first paint is still the "Carregando" notice.
- Switch profile mid-flight (click one profile then another quickly) and confirm
  the board settles on the LAST profile picked, not the first response back.
- Stop the dev server, click a cap, and confirm the failure is visible rather
  than silently showing the previous cap's numbers as if they were current.

## Forbidden
- No new dependency.
- Do not drop the `let current` race guard or the `result.error || !result.data`
  check.
- Do not move the fetch into a Server Component or a route-level loader — the
  screen is client-side by design and this task is not a rewrite.
