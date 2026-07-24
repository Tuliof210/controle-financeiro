# Pin MoneyInput caret to the right (odometer-style entry)

## Description
`MoneyInput` (`src/components/MoneyInput/`) stores integer **cents** as its
source of truth and re-derives the displayed string on every keystroke:
`display = formatCents(valueCents)` and `onChange(digitsToCents(e.target.value))`.
The numeric pipeline is correct — the bug is that nothing manages the caret.
The `<input>` is fully controlled and reformatted every keystroke, but the
caret can be left of the comma, so inserting a digit there re-parses *all*
digits shifted by one place: R$ 6,00 becomes R$ 600,00 (the reported
"6 reais virar 600 reais").

Fix: make the field behave like an odometer — the caret is always pinned to the
far right, so typing only ever appends a digit and the value fills
right-to-left (`6` → `0,06`, `0` → `0,60`, `0` → `6,00`). This removes the
ability to position the caret left of the comma entirely, killing the bug.

**Do not touch** `money.helper.ts` (`formatCents`/`digitsToCents`) — it is
correct and the integer-cents storage must not change. This is a DOM/caret
concern confined to `hook.ts` + `index.tsx`.

## When to run
- Depends on: none
- Parallel-safe with: 02, 03 (touches only `src/components/MoneyInput/`, which
  neither of them edits)

## How-to
Files (read them first — small):
- `src/components/MoneyInput/index.tsx` — renders `<input inputMode="decimal"
  value={display} onChange={onChange} …>`. Currently no `ref`, no `onFocus`.
- `src/components/MoneyInput/hook.ts` — `useMoneyInput({ valueCents, onChange })`
  returns `{ display, onChange, inputProps }`-ish. Add the caret logic here
  (per project convention `index.tsx` stays logic-free and blindly renders what
  the hook returns).

Implementation:
1. In `hook.ts`, create an input `ref` (`useRef<HTMLInputElement>(null)`).
2. Pin the caret to the end whenever the displayed value changes and on focus:
   - `useLayoutEffect` keyed on `display` (or `valueCents`) that, if the input
     is the active element, sets
     `ref.current.setSelectionRange(len, len)` where `len = ref.current.value.length`.
   - An `onFocus` handler that does the same `setSelectionRange(len, len)` so a
     click/tab lands the caret at the far right.
3. Return `inputRef` and `onFocus` from the hook; in `index.tsx` spread
   `ref={inputRef}` and `onFocus={onFocus}` onto the `<input>`. Keep
   `index.tsx` free of logic.
4. Keep the existing `onChange` → `digitsToCents` wiring exactly as-is.

Both files stay well under the 100-line Biome cap (`noExcessiveLinesPerFile`,
`maxLines: 100`).

Notes / gotchas:
- Use `useLayoutEffect`, not `useEffect`, so the caret is corrected before the
  browser paints (avoids a visible caret jump).
- `MoneyInput` is also used by `MonthlyGoalSection`/`GoalForm` — a shared
  component, so this one fix covers every caller. Verify those still behave.

Testing / verification:
- No unit test needed for `money.helper.ts` (unchanged). Caret behavior is a
  DOM concern; verify manually in the browser (see below). Per project
  convention only `hook.ts`/`service.ts` with real branching/loops/delta math
  get a colocated `*.test.ts`, and this caret glue has none.
- Manual smoke test (dev server):
  1. `npm run db:setup` (fresh worktree — the SQLite file isn't shared across
     worktrees).
  2. `npm run dev`, open Recorrências → "Adicionar".
  3. Type `6` `0` `0` in the value field → shows `6,00` (not `600,00`).
  4. Click in the middle of an existing value → caret snaps to the far right;
     the displayed number does not change.
  5. Confirm the Goals form's money field (`/` dashboard section using
     `MoneyInput`) still accepts input normally.

Verification commands (repo root):
```
npm run lint
npm run test
npm run build
```
All three must be green.
