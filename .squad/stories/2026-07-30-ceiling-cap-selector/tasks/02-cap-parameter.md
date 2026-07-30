# The ceiling cap becomes a request parameter

## Outcome
- `GET /api/dashboard?owner=x&cap=25` returns strictly smaller monthly ceilings
  than `&cap=75`, and the same request without `cap` behaves exactly as `cap=50`.
- The whole payload follows the cap — `ceiling`, `pace` and `goals` — because
  they are all computed downstream of one `buildCeiling` call.
- An absent, malformed or out-of-enum `cap` still returns a 200 payload at the
  default. No new error path reaches the screen.

## Context

**The chain is four files and nothing caches**:
`route.ts` → `getDashboard(owner)` → `buildPayload({...})` → `buildCeiling(points, range.current)`.
`payload.helper.ts` already does `const ceiling = buildCeiling(points, range.current); const pace = savingPace(ceiling);`
and `goals: projectGoals(goals, { pace, current: range.current })`, so threading
the cap into `buildCeiling` recomputes the whole payload for free.

**The arithmetic.** Today, `ceiling.helper.ts`:
`const budget = red ? 0 : Math.floor((4 * gap) / 5);`
guarded by a comment that is the real contract: *"`(4 * gap) / 5` floored, in that
order, never leaves the integers. Writing it as `0.8 * gap` and flooring per step
would compound float error down a recursion as deep as the range is long.
Math.floor everywhere: a spending allowance always rounds DOWN. Never
Math.trunc — it differs on negatives."*
The generic form that keeps that promise is `Math.floor((gap * cap) / 100)` —
multiply first, divide once. Never `Math.floor(gap * (cap / 100))`.
`gap` is a non-negative integer by construction: `cumulative` in
`series.helper.ts` is a running sum of `valueCents`, Zod-guarded as
`z.number().int()` at every write boundary; `worst[]` is a `Math.min` over those;
`authorised` is a sum of floors.

**Where the enum lives.** Follow `src/lib/entry-types.ts` verbatim —
`export const ENTRY_TYPES = ["income", "expense"] as const;` plus
`export type EntryType = (typeof ENTRY_TYPES)[number];` — consumed by
`src/lib/movement-schema.ts` as `type: z.enum(ENTRY_TYPES)`. A sibling
`src/lib/ceiling-caps.ts` holding the three caps and the default is the same
shape, and it is the ONE place task 03's client reads its initial value from, so
the server default and the UI default cannot drift.

**Validation, and why it is not the `owner` shortcut.** `route.ts` deliberately
skips Zod for `owner` — its comment says *"`owner` is a single free-form string …
so there is no shape to validate beyond non-empty"*. `cap` is the opposite: a
closed enum feeding integer arithmetic, where `cap=abc` yields `NaN` budgets
through the entire payload. Validate it. But **do not `fail(...)` on a bad cap** —
`src/lib/api.ts` surfaces any error body as the screen's red Notice,
indistinguishable from a real outage, for a value only our own UI sets. Parse
with a default instead (Zod's `.catch(...)` on the enum). Query params are always
strings, so the enum is over strings and the number conversion happens after.
For reference, the repo's parse-and-fail pattern where a 422 IS wanted
(`src/app/api/people/route.ts`): `const parsed = createSchema.safeParse(await safeJson(request)); if (!parsed.success) { return fail("Dados inválidos", "validation", 422); }`
and `src/lib/http.ts`: `export const ok = <T>(data: T, status = 200) => NextResponse.json({ data }, { status });`

**Line budget.** `ceiling.helper.ts` was at exactly 100 before task 01 freed
~8-10 lines; that is this task's entire allowance. `series.helper.ts` is at 94 and
is cap-independent — do not touch it. `payload.helper.ts` (49) and `service.ts`
(38) have room.

**Stale prose to fix while you are here.** `.squad/debt.md` has two entries whose
premise is the fixed 80%: one on the geometric decay of the monthly ceilings
("each month is given 80% of what the earlier ones left it"), one proposing an
assertion hardcoded to `Math.floor((4 * ceilingBalance) / 5)`. Re-scope both to
the selected cap.

## Scope
- In: `src/lib/ceiling-caps.ts` (new), `src/app/api/dashboard/route.ts`,
  `service.ts`, `payload.helper.ts`, `ceiling.helper.ts`, `.squad/debt.md`.
- Out: every client file — task 03 wires the UI. `pace.helper.ts` is untouched:
  its divisor 4 is an independent owner decision, not a share of the cap.

## Verify
- `npm run lint`, `npm run build`, `npm test` (the suite still sends no `cap`,
  which is the default-path proof).
- With `npm run dev` up, for each of `25`, `50`, `75` and omitted:
  `curl -s 'http://localhost:3000/api/dashboard?owner=familia&cap=25' | head -c 400`
  Confirm the monthly figure at 25 < 50 < 75, that omitted equals 50, and that
  `curl ... '&cap=abc'` and `'&cap=0'` both return 200 at the default rather than
  an error envelope.
- Confirm every `budget` in `ceiling.months` is an integer at every cap
  (`Number.isInteger`) — a float here means the multiply/divide order slipped.

## Forbidden
- No `gap * (cap / 100)`, no `Math.trunc`, no `Math.round`, no per-step float.
- Do not make a bad `cap` a 4xx.
- Do not add caching or memoisation of the payload per cap.
- Do not change the default from 50, and do not hardcode it in more than one
  place.
