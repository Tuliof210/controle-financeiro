# Copy the month's entradas and saídas to the clipboard

## Description
The point of the OFX reader is to stop retyping numbers: read a month's total,
put it in Movimentações. Task 02 renders those totals as text, which still
means selecting `R$ 4.312,50` by hand and cleaning the `R$` and the thousands
dots out of it before it pastes.

This task adds a copy button to each **entradas** and **saídas** cell of the
monthly table. It copies `4312,50` — `formatCents` output: unsigned, ungrouped,
comma decimal. That is exactly what `MoneyInput` accepts: it runs every paste
through `digitsToCents`, which keeps only the digits, so `4312,50` lands as
`R$ 4.312,50` and nothing has to be edited.

Two deliberate restrictions:

- **Only the entradas and saídas cells.** Not saldo, not the totals row — the
  owner asked for the per-month income and expense figures, which are the two
  numbers Movimentações actually wants.
- **Only when the value is non-zero.** The table is zero-filled by design, and
  a copy button on a `R$ 0,00` row is noise offering nothing.

A clipboard write can fail — `navigator.clipboard` is undefined on an insecure
origin and the promise rejects when permission is denied. The failure must be
visible, never swallowed: silent success-looking failure here means the owner
pastes whatever was on the clipboard before.

## When to run
- Depends on: 02-ofx-screen.md (it creates `MonthRow`, which this task edits).
  Run after it merges and `git fetch origin main` first.
- Parallel-safe with: none

## How-to

### Files
```
…/ReportView/components/MonthRow/components/CopyButton/index.tsx | hook.ts | style.module.scss
…/ReportView/components/MonthRow/index.tsx      (edit: two cells)
…/ReportView/components/MonthRow/hook.ts        (edit: two raw values + two labels)
…/ReportView/components/MonthRow/hook.test.ts   (edit: cover them)
…/ReportView/components/MonthRow/style.module.scss (edit: cell layout)
```
`CopyButton` lives under `MonthRow/components/` because `MonthRow` is its only
consumer. It gets promoted to `OfxScreen/components/` the day something outside
`MonthRow` uses it — not before.

### 1. `MonthRow/hook.ts` — the values to copy
Add four fields to what the hook already returns:

```ts
copyIncome: month.incomeCents > 0 ? formatCents(month.incomeCents) : null,
copyExpense: month.expenseCents > 0 ? formatCents(month.expenseCents) : null,
copyIncomeLabel: `Copiar entradas de ${label}`,
copyExpenseLabel: `Copiar saídas de ${label}`,
```
`formatCents` from `@/lib/money` — **not** `formatMoney`. Its own comment
spells out why it exists: sign-less and ungrouped on purpose. `null` is the
"render no button" signal, so `index.tsx` stays a ternary and keeps its no-logic
contract.

The labels are built here rather than in `CopyButton` for the same reason
`SectionCard` names its tooltip after the card: a table of twelve rows with
twenty-four buttons all announced as "Copiar" is unusable with a screen reader.

`hook.test.ts` — extend the existing cases: a month with both values non-zero
returns both `copy*` strings in `formatCents` form (assert `"4312,50"`, not
`"R$ 4.312,50"`); a zero-filled month returns `null` for both; the labels carry
the month label.

### 2. `MonthRow/index.tsx`
Wrap each money cell's content so the value and the button sit on one line:
```tsx
<td>
  <span className={styles.cell}>
    {income}
    {copyIncome ? (
      <CopyButton text={copyIncome} label={copyIncomeLabel} />
    ) : null}
  </span>
</td>
```
`style.module.scss` — `.cell { display: inline-flex; align-items: center;
gap: var(--space-2); justify-content: flex-end; }`. The cells are already
`text-align: right`.

### 3. `CopyButton/hook.ts`
Props: `{ text: string; label: string }`.

```ts
type Status = "idle" | "done" | "failed";
```
One `useState<Status>`, and a `useEffect` keyed on `status` that schedules a
1500 ms `setTimeout` back to `"idle"` and returns its `clearTimeout` — without
the cleanup, a row unmounted by "Trocar arquivo" sets state after unmount.
Return early from the effect while `status === "idle"` so it does not schedule
a timer on mount.

```ts
const copy = async () => {
  try {
    await navigator.clipboard.writeText(text);
    setStatus("done");
  } catch {
    setStatus("failed");
  }
};
```
The `try` must wrap the *property access* too, not just the promise:
`navigator.clipboard` is `undefined` on an insecure origin, so the expression
throws a `TypeError` synchronously — inside an `async` function that still
becomes a rejected promise the `catch` sees, which is why this shape works and
a bare `.catch()` on the call would not.

Return `{ status, copy, label, announcement }`, where `announcement` is
`""` / `"Copiado"` / `"Falha ao copiar"` per status.

### 4. `CopyButton/index.tsx`
Reuse `IconButton` — it is already 44×44 with the focus ring, which satisfies
`src/styles/README.md` rule 7's hit-target floor without a single hardcoded
size. Do **not** shrink it to fit the table row; the row grows instead.

```tsx
<IconButton aria-label={label} variant={status === "failed" ? "danger" : "ghost"} onClick={copy}>
  <Icon size={16} aria-hidden />
  <span className={styles.sr} aria-live="polite">{announcement}</span>
</IconButton>
```
`Icon` is `Copy` when idle, `Check` when done, `X` when failed — all three from
`lucide-react`, all verified present. `size={16}` matches every other
`IconButton` call site (`EntryRow`, `PersonRow`).

The live region is a permanent child whose *text* changes — a region added to
the DOM at the moment of the announcement is unreliably announced. There is no
visually-hidden utility class in this repo (grepped: none), so define one
locally:
```scss
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
```
Status is carried by the icon **and** the announcement, never by colour alone
(README rule 7).

### 5. Testing `CopyButton/hook.ts`
It calls `useState` and `useEffect`, so it cannot run outside a renderer, and
this repo has **no jsdom, no happy-dom and no @testing-library** — `vitest.config.ts`
has no `test` block at all, so the environment is plain `node`.

`.squad/learnings.md` records "this can't be tested" being waived falsely three
times here, twice on hooks that turned out to call no React hook. So **verify
the claim before writing it**: write a throwaway `hook.test.ts` that imports
`useCopyButton` and calls it, run `npm run test`, confirm it fails with
React's "invalid hook call", delete it, and only then state the waiver in the
PR body. The behaviour is covered by the browser check below instead.

`MonthRow/hook.ts` stays pure and **is** tested — that is where the copied
string is decided, which is the part that can silently be wrong.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

Re-measure all three baselines on the merged `main` before comparing — tasks 01
and 02 both added tests, so the story's opening numbers (33 files / 237 tests)
are stale by now. The lint baseline (**2 errors + 1 info**, all outside `src/`)
and the tsc baseline (**1 error**, `ThemeToggle/theme.helper.test.ts`) should be
unchanged; disclose both in the same terms in the PR body. Never run
`npm run lint:fix`.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. `http://localhost` is
a secure context, so the real clipboard API is available.

- Load a report. Every non-zero entradas and saídas cell has a button; the
  zero-filled rows have none.
- Click one: the icon becomes a check and returns to the copy icon after ~1.5 s.
- Read the clipboard back with `javascript_tool`
  (`navigator.clipboard.readText()`) and confirm it is `4312,50` — no `R$`, no
  thousands dot, comma decimal.
- Paste it into a `MoneyInput` on Movimentações and confirm the field shows
  `R$ 4.312,50`. This is the whole feature; verify it end to end, do not infer
  it from the string.
- A ref-based click can land on nothing even when the tool reports success —
  confirm the state actually changed with a **separate** `javascript_tool` read
  (a read in the same call as the click reports the pre-change value), and fall
  back to `element.click()` if nothing happened.
- 375px: the buttons stay inside the horizontally-scrolling `.tableWrap` and do
  not push the page body wider.
- Dark theme, and no console error.

### Anything else you touch
No new dependency, no API change, no state persisted. `MonthRow` is the only
pre-existing component edited, and only in the three files of its own folder.
