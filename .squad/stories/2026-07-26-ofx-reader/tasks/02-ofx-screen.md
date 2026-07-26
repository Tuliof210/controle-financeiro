# The `/leitor-ofx` screen — upload, session cache, metadata header, monthly table

## Description
Task 01 shipped `POST /api/ofx`, which turns an uploaded statement into an
`OfxReport`. This task is the screen that uses it: a new sidebar entry, an
upload card, and a report view with a metadata header, the monthly totals
table and the two footer buttons the owner asked for.

Three things here are firsts in this repo, and each carries a trap:

1. **`sessionStorage`.** Nothing in `src/` uses it — only `localStorage`, in
   `ThemeToggle/hook.ts` and `ProfileProvider/hook.ts`. Copy their shape
   exactly: read inside a `useEffect` (never during render, so there is no
   hydration mismatch and no `typeof window` check), write-through on every
   setter, every access wrapped in `try {} catch {}` with an empty catch.
2. **A multipart upload from the client.** `src/lib/api.ts`'s `apiPost`
   hardcodes `content-type: application/json` and `JSON.stringify` — it cannot
   send a file. But its private `request()` already handles the `{data}` /
   `{error}` envelope, and `.squad/learnings.md` records two live traps in it
   (it **never rejects**, and any 2xx with no `data` key resolves to
   `{data: undefined, error: undefined}` — neither branch). So add an
   `apiUpload` that reuses `request()` rather than hand-rolling a second
   unwrapper, and guard callers with `if (result.error || !result.data)`.
3. **A real `<table>`.** `grep` for `<table|<thead|<tbody|<tr` over `src/`
   returns nothing — every list in this app is a `<ul>` of flex rows with
   per-cell `min-width`, which does not align columns across rows. A
   five-column numeric report is genuinely tabular and gets table semantics.
   This is a deliberate first; say so in the PR body.

The two buttons are **not** the same action. `Fechar` drops the report and
clears the session key, returning to the upload card. `Trocar arquivo` opens
the file picker directly and swaps the report on success — and on a rejected
file the current report **stays on screen** with the error shown, which is the
whole reason it is a separate button.

Copy-to-clipboard on the money cells is **task 03**. Render the values as plain
text here.

## When to run
- Depends on: 01-ofx-api.md (imports `OfxReport` / `OfxMonth` / `OfxAccount`
  from `@/app/api/ofx/types` and calls the endpoint it creates). Run after it
  merges and `git fetch origin main` first.
- Parallel-safe with: none

## How-to

### Files
```
src/components/AppShell/components/Aside/hook.ts        (edit: one nav entry)
src/lib/api.ts                                          (edit: apiUpload)
src/app/leitor-ofx/page.tsx
src/app/leitor-ofx/_components/OfxScreen/index.tsx | hook.ts | style.module.scss
src/app/leitor-ofx/_components/OfxScreen/session.helper.ts + session.helper.test.ts
src/app/leitor-ofx/_components/OfxScreen/components/FilePicker/  index|hook|style
src/app/leitor-ofx/_components/OfxScreen/components/UploadCard/  index|hook|style
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/  index|hook|style
                                        + ReportView/hook.test.ts
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/AccountLine/ index|hook|style
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthRow/    index|hook|style
                                        + MonthRow/hook.test.ts
```
Every component folder is exactly the three files: `index.tsx` blindly calls
the folder's `hook.ts` and renders JSX with **no logic, state or effects**;
`hook.ts` holds everything else; `style.module.scss` uses
`@use "theme" as t;` and `var(--token)` only — never a hardcoded colour,
space, radius, shadow or duration.

### 1. Nav — `Aside/hook.ts`
Append to `TOP_ITEMS`, after Recorrências (Configurações stays alone in
`BOTTOM_ITEM`):
```ts
{ href: "/leitor-ofx", label: "Leitor OFX", icon: FileUp },
```
`FileUp` from `lucide-react`. Active state is exact-equality on `pathname`,
computed in `Aside/index.tsx` — nothing else to change.

### 2. `src/lib/api.ts` — `apiUpload`
```ts
// Multipart, so the content-type header is deliberately absent: the browser
// has to set it itself to include the boundary. Everything else goes through
// the same request() envelope handling as the JSON helpers.
export const apiUpload = <T>(url: string, file: File) => {
  const body = new FormData();
  body.append("file", file);
  return request<T>(url, { method: "POST", body });
};
```

### 3. `page.tsx`
Five lines, server component, no `"use client"`, no `metadata` export — match
`src/app/movimentacoes/page.tsx`:
```tsx
import { OfxScreen } from "./_components/OfxScreen";

export default function Page() {
  return <OfxScreen />;
}
```

### 4. `session.helper.ts` (+ test)
Vitest runs in the `node` environment with no jsdom — `sessionStorage` does not
exist there. So the **pure** half lives here and is tested; the three storage
calls stay inline in `hook.ts`'s try/catch, exactly as `ThemeToggle` and
`ProfileProvider` keep theirs inline.

```ts
export const SESSION_KEY = "ofx-report";

// sessionStorage can hold anything a previous version of this screen (or a
// user with devtools) put there — parse defensively and treat any shape that
// is not a report as absent, rather than letting the table map over undefined.
export function parseSession(raw: string | null): OfxReport | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.months) && Array.isArray(parsed?.accounts)
      ? (parsed as OfxReport)
      : null;
  } catch {
    return null;
  }
}
```
`session.helper.test.ts`: `null` → `null`; `""` → `null`; `"{"` → `null`;
`'{"months":1}'` → `null`; `'{"foo":1}'` → `null`; a serialized valid report
round-trips to an equal object.

### 5. `OfxScreen/hook.ts` — the lifecycle
State: `report: OfxReport | null`, `error: string | null`,
`loading: boolean`, `loaded: boolean`.

- One `useEffect(() => { … }, [])` reads
  `parseSession(sessionStorage.getItem(SESSION_KEY))` inside `try {} catch {}`,
  sets `report`, and always sets `loaded` to true.
- `upload(file: File)` — set `loading`, clear `error`, call
  `apiUpload<OfxReport>("/api/ofx", file)`. Guard the result with
  `if (result.error || !result.data)` and surface
  `result.error ?? "Erro inesperado"`; **`api.ts` never rejects**, so a missing
  check reads a failure as success. On success set `report` and write
  `sessionStorage.setItem(SESSION_KEY, JSON.stringify(result.data))` in a
  try/catch. Clear `loading` in both branches.
- `close()` — `setReport(null)`, `setError(null)`, and
  `sessionStorage.removeItem(SESSION_KEY)` in a try/catch.
- Return `{ loaded, report, error, loading, upload, close }`.

Keep it under 100 lines; if the two storage try/catch blocks push it over,
extract them as `readStored()` / `writeStored()` / `clearStored()` at the top
of the same file, not into a new folder.

### 6. `OfxScreen/index.tsx`
```tsx
"use client";
```
on line 1 — the screen's `index.tsx` is where `"use client"` lives in this repo
(`page.tsx` stays a server component).

```tsx
<div className={styles.screen}>
  <h1 className={styles.eyebrow}>Leitor OFX</h1>
  {loaded ? (report ? <ReportView … /> : <UploadCard … />) : null}
</div>
```
The `loaded` gate matters: `report` starts `null` and only the effect knows
whether a session report exists, so rendering `UploadCard` unconditionally
flashes it on every reload of a screen whose entire point is surviving reload.
Rendering nothing until `loaded` costs one boolean. `ThemeToggle/index.tsx`
uses the same trick (`theme === null` → an empty `<span>` placeholder).

`style.module.scss` — `.screen` and `.eyebrow` are byte-identical across
`EntryScreen`, `SettingsScreen` and `DashboardScreen`; copy them verbatim:
```scss
.screen { display: flex; flex-direction: column; gap: var(--space-6); }
.eyebrow {
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-display);
}
```

### 7. `FilePicker` — shared by both cards
Both the upload card's primary action and the report's "Trocar arquivo" open a
file picker; duplicating the input in two places is exactly the repetition the
architecture's recursion rule forbids.

`hook.ts` — props `{ label: string; disabled?: boolean; onFile: (file: File)
=> void }`. Holds a `useRef<HTMLInputElement>`, an `open()` that calls
`ref.current?.click()`, and a `change` handler that reads
`event.target.files?.[0]`, calls `onFile`, then resets `event.target.value = ""`
— without the reset, picking the *same* file twice fires no `change` event and
"Trocar arquivo" silently does nothing the second time.

`index.tsx` — a hidden `<input type="file" accept=".ofx,text/plain">` plus a
`<Button>` proxy that calls `open()`. Use the `hidden` attribute (not
`display: none` in CSS): it takes the input out of the tab order and the
accessibility tree, leaving the `<Button>` as the single accessible control,
and `<Button>` already carries the 44px min-height and the focus ring.

### 8. `UploadCard`
`<SectionCard title="Enviar extrato OFX" icon={FileUp}>` containing a short
muted `<p>` explaining what the screen does and what it does not
(«Lê o arquivo e mostra entradas e saídas por mês. Nada é salvo no banco.»),
the `<FilePicker label="Escolher arquivo" …>`, and the error `<p>` when set.

Error markup matches `TextField`'s exactly — the `▲` prefix is the repo's
error idiom:
```tsx
<p className={styles.error}><span aria-hidden>▲</span> {error}</p>
```
```scss
.error {
  display: flex; align-items: center; gap: var(--space-1); margin: 0;
  color: var(--color-negative);
  font-family: var(--font-mono); font-size: var(--text-sm);
}
```
While `loading`, disable the picker and show «Lendo o arquivo…» in the muted
`<p>` — the parse is a round trip and the button must not be clickable twice.

### 9. `ReportView`
Props: `{ report: OfxReport; error: string | null; loading: boolean;
onClose: () => void; onFile: (file: File) => void }`.

`hook.ts` is **pure** — no React hook call, because `FilePicker` owns the only
ref. That makes it directly testable, and `.squad/learnings.md` records this
waiver being claimed falsely three times: write `ReportView/hook.test.ts`.
It returns:

| field | value |
|---|---|
| `fileName` | `report.fileName` |
| `org` | `report.org ?? "—"` (add `report.fid` as `` `${org} · ${fid}` `` when present) |
| `currency` | `report.currency ?? "—"` |
| `period` | `` `${formatYyyymm(first)} – ${formatYyyymm(last)}` `` from `report.months`, or `"—"` when empty |
| `count` | `` `${report.totals.count}` `` |
| `accounts` | mapped for `AccountLine`, each with a stable `key` (`` `${bankId}-${accountId}-${index}` ``) |
| `rows` | `report.months` passed through to `MonthRow` |
| `totals` | `{ income, expense, balance }` formatted with `formatMoney`, plus `negative: report.totals.balanceCents < 0` |

`index.tsx` structure, inside `<SectionCard title="Relatório OFX" icon={FileText}>`:

```tsx
<dl className={styles.facts}>
  <div><dt>Instituição</dt><dd>{org}</dd></div>
  <div><dt>Período</dt><dd>{period}</dd></div>
  <div><dt>Moeda</dt><dd>{currency}</dd></div>
  <div><dt>Lançamentos</dt><dd>{count}</dd></div>
</dl>
<ul className={styles.accounts}>
  {accounts.map((account) => <AccountLine key={account.key} {...account} />)}
</ul>

<div className={styles.tableWrap}>
  <table className={styles.table}>
    <caption className={styles.caption}>Entradas e saídas por mês</caption>
    <thead>
      <tr>
        <th scope="col">Mês</th><th scope="col">Entradas</th>
        <th scope="col">Saídas</th><th scope="col">Saldo</th>
        <th scope="col">Lanç.</th>
      </tr>
    </thead>
    <tbody>{rows.map((row) => <MonthRow key={row.month} month={row} />)}</tbody>
    <tfoot>…the totals row, `<th scope="row">Total</th>` + four `<td>`…</tfoot>
  </table>
</div>

{error ? <p className={styles.error}>…</p> : null}

<div className={styles.actions}>
  <Button variant="ghost" onClick={onClose}>Fechar</Button>
  <FilePicker label="Trocar arquivo" disabled={loading} onFile={onFile} />
</div>
```
The file name goes above the `<dl>` in its own `<p className={styles.file}>`.

`style.module.scss`:
- `.tableWrap { overflow-x: auto; }` — five numeric columns do not fit 375px,
  and the page body must never scroll horizontally.
- `.table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm); }`
- `th, td { padding: var(--space-2) var(--space-3); text-align: right; border-bottom: var(--border-1) solid var(--color-border-subtle); font-variant-numeric: tabular-nums; }`
  with the first column `text-align: left`, and `thead th` in
  `var(--color-text-muted)` at `--text-xs`.
- `.facts` is a wrapping flex/grid of `dt`/`dd` pairs; `dt` muted at
  `--text-xs`, `dd` at `--text-sm`, `margin: 0` on both.
- `.actions { display: flex; flex-wrap: wrap; gap: var(--space-3); }`
- `.caption { text-align: left; color: var(--color-text-muted); font-size: var(--text-xs); padding-bottom: var(--space-2); }`

### 10. `AccountLine`
An `<li>` reading e.g. `001 · 12345-6 · CHECKING · saldo R$ 1.499,75 em Fev/26`.
`hook.ts` builds the string from the nullable fields, dropping the segments
that are `null` and omitting the balance clause entirely when
`balanceCents === null`. Pure, no React hook — it is a `.join(" · ")` over a
filtered array. Muted, `--font-mono`, `--text-sm`.

### 11. `MonthRow` (+ `hook.test.ts`)
Props `{ month: OfxMonth }`. `hook.ts` is pure and returns:
`label` (`formatYyyymm(month.month)`), `income` / `expense` / `balance`
(`formatMoney`), `count`, and `negative` (`month.balanceCents < 0`). Renders
one `<tr>` with `<th scope="row">{label}</th>` and four `<td>`.

Colour: entradas gets `--color-positive`, saídas `--color-negative`, saldo
takes `--color-negative` only when negative. The column headers already name
each value and `formatMoney` prefixes U+2212 on negatives, so the colour is
redundant reinforcement, never the only carrier of meaning. Do **not**
special-case these colours to dodge the light theme's contrast shortfall on
`--color-positive`/`--color-negative`: it is pre-existing and deliberately
deferred by the owner (2026-07-25), and it must not appear as a claim in the
PR body either — measure or say nothing.

`hook.test.ts`: a positive-balance month, a negative one, a zero-filled month
(`0,00` in all three money fields, `count` 0, `negative` false), and the label
format.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npm run test && npx tsc --noEmit && npm run build
```

- `npm install` matters: task 01 may have landed manifest changes whose
  `node_modules` a fresh worktree does not have.
- `npm run db:setup` before the browser check — the SQLite file is gitignored
  and not shared across worktrees; without it every other screen 500s.
- Baselines to compare against, disclosed uniformly in the PR body:
  lint **2 errors + 1 info** (`.design-sync/gen-cards.mjs`, `biome.json`);
  tsc **1 error** (`ThemeToggle/theme.helper.test.ts`); test **33 files / 237
  tests** *plus whatever task 01 added* — re-measure the baseline on the merged
  `main` rather than reusing this number. Never run `npm run lint:fix`.
- Count lines by hand on every new file. `noExcessiveLinesPerFile` is
  configured at 100 but emits nothing — verified silent on a 1562-line file.

### Browser check
`preview_start`'s `{name}` launcher runs from the MAIN checkout, so start the
dev server manually from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. Use the synthetic
fixture from task 01's `fixtures.helper.ts`, written to a `.ofx` file outside
the repo.

- The sidebar shows **Leitor OFX** after Recorrências and highlights it on
  `/leitor-ofx`.
- Uploading the fixture renders the header and a table whose Jan/26 and Feb/26
  rows match the fixture's known totals.
- **Reload the page**: the report survives. Then check
  `sessionStorage.getItem("ofx-report")` via `javascript_tool` — and remember
  that state read in the SAME call as the action that changed it reports the
  PRE-change value; re-read in a separate call before concluding anything.
- `Fechar` → upload card returns **and** `sessionStorage.getItem("ofx-report")`
  is `null` in a fresh call.
- `Trocar arquivo` → picker opens, a second valid file swaps the report; a
  `.txt` file leaves the current report on screen with the error visible.
- A zero-filled month renders `R$ 0,00` and `0`.
- `resize_window` to 375px: the table scrolls inside `.tableWrap` and the page
  body does **not** scroll horizontally; the two buttons wrap.
- Re-check in dark theme, and confirm no console error.
- Confirm nothing persisted: after a parse, Movimentações and the Dashboard
  are unchanged.

Driving the file input: `computer`'s click may land on nothing even when it
reports success — verify via `read_network_requests` that `POST /api/ofx`
actually fired, and fall back to `javascript_tool` setting the input's `files`
via a `DataTransfer` if the native picker cannot be driven.

### Anything else you touch
No new dependency, no migration, no change to any existing API contract. Two
pre-existing files are edited and only by appending: `Aside/hook.ts` (one nav
entry) and `src/lib/api.ts` (one exported helper). No other screen's behaviour
changes.
