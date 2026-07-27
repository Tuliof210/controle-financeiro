# Leitor OFX — dropzone, indeterminate loading state, restyled report

## Description
The OFX screen has two states today (upload card, report) and no feedback while
parsing beyond swapping one sentence. The design gives it three:

1. **A dropzone.** A large dashed panel with an upload glyph that accepts a file
   dropped onto it as well as one picked from the button, and visibly reacts to
   drag-over. This is a UI affordance over the flow that already exists — the
   same `File`, the same `apiUpload`, the same endpoint.
2. **A loading state.** An indeterminate progress bar plus skeleton rows while
   the request is in flight. The design's four-step checklist ("Conciliando com
   movimentações…", "Detectando recorrências") is **not** built: none of that
   happens — `POST /api/ofx` is one round trip that parses and returns — and
   the owner chose the honest version during refinement.
3. **A restyled report.** A "N lançamentos lidos" badge, a metadata row, the
   monthly table reframed, and the two footer buttons.

The design's third footer button, **"Importar como movimentações", is cut** —
it needs a bulk-create endpoint and a confirmation flow, and this story ships no
backend.

Nothing about the parse changes: same route, same 5 MB cap, same error codes,
same `sessionStorage` cache under `"ofx-report"`, same copy-to-clipboard
buttons on the money cells.

## When to run
- Depends on: 02-shell.md (`PageHeader` replaces the screen's `<h1>`) and
  03-primitives.md (`SectionCard`, `Button`, `IconButton`). Run after both merge
  and `git fetch origin main` first.
- Parallel-safe with: 04, 05, 06 and 08 — no shared file.

## How-to

### Files
```
src/app/leitor-ofx/_components/OfxScreen/index.tsx | hook.ts | style.module.scss  (edit)
src/app/leitor-ofx/_components/OfxScreen/components/UploadCard/  index|hook|style|hook.test.ts (edit)
src/app/leitor-ofx/_components/OfxScreen/components/DropZone/    index|hook|style + hook.test.ts (new)
src/app/leitor-ofx/_components/OfxScreen/components/LoadingCard/ index|hook|style (new)
src/app/leitor-ofx/_components/OfxScreen/components/FilePicker/  index|hook|style (edit: style only)
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/  index|hook|style|hook.test.ts (edit)
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/MonthRow/   style.module.scss (edit)
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/TotalsRow/  style.module.scss (edit)
src/app/leitor-ofx/_components/OfxScreen/components/ReportView/components/AccountLine/ style.module.scss (edit)
```

### 1. The three-state switch
`OfxScreen/index.tsx` today is `loaded ? (report ? <ReportView/> : <UploadCard/>) : null`.
It becomes:

```tsx
{loaded ? (
  loading ? <LoadingCard fileName={fileName} />
  : report ? <ReportView … />
  : <UploadCard … />
) : null}
```
Keep the `loaded` gate exactly as it is. `report` starts `null` and only the
`sessionStorage` effect knows whether one exists; rendering the upload card
unconditionally flashes it on every reload of a screen whose entire point is
surviving reload.

`loading` already exists in `OfxScreen/hook.ts`. `fileName` does not — add it:
set it in `upload(file)` before the request (`setFileName(file.name)`) so the
loading card can name the file the way the design does. Clear it on `close()`.
It is display-only; do not persist it to `sessionStorage` (the report already
carries `fileName`).

**`apiUpload` never rejects.** Every failure — bad body, thrown `fetch`, non-OK
status — resolves to `{ error }`, and any 2xx without a `data` key resolves to
`{ data: undefined, error: undefined }`, which is neither branch. The existing
`if (result.error || !result.data)` guard in `upload()` covers both; do not
loosen it while adding `fileName`, or a failed parse reads as success and the
screen strands on the loading card forever.

### 2. `DropZone` — the idle state
`UploadCard` currently is a `SectionCard` with a note, a `FilePicker` and an
error line. The design replaces it with a large dashed panel. Keep `UploadCard`
as the wrapper that owns the copy and the error, and put the drag behaviour in
`DropZone` so the handlers are isolated and testable.

`DropZone/hook.ts` — props `{ disabled?: boolean; onFile: (file: File) => void }`:
```ts
const [over, setOver] = useState(false);

// dragover must preventDefault on EVERY event, not just the first: without it
// the browser navigates to the dropped file and the SPA is gone.
const onDragOver = (e: DragEvent<HTMLElement>) => { e.preventDefault(); if (!disabled) setOver(true); };
const onDragLeave = () => setOver(false);
const onDrop = (e: DragEvent<HTMLElement>) => {
  e.preventDefault();
  setOver(false);
  if (disabled) return;
  const file = e.dataTransfer.files?.[0];
  if (file) onFile(file);
};
```
Take **only the first file** — the endpoint accepts one `file` field, and
silently parsing the first of five is better than an error the user cannot act
on. No client-side extension check: the route already refuses a non-OFX file
with a specific message (`not_ofx`), and a second, looser check here would
reject files the server would have accepted.

The panel:
```scss
.zone {
  display: flex; flex-direction: column; align-items: center;
  padding: var(--space-20) var(--space-6);
  text-align: center;
  background: var(--color-surface);
  border: var(--border-3) dashed var(--color-border);
  border-radius: var(--radius-md);
  transition: background var(--duration-base) var(--ease-snappy);
}
.over { background: var(--color-surface-raised); border-color: var(--color-brand); }
```
Contents, in the design's order: a 64×64 bordered box holding an upload glyph
(`Upload` from lucide, `size={28}`, `aria-hidden`), the eyebrow
`ARRASTE O EXTRATO .OFX` (`--font-display`, `--text-2xs`, `--tracking-wide`),
the muted paragraph *"O arquivo é lido no seu navegador e some quando você fecha
a aba. Nada é salvo no banco."*, the `FilePicker` button
(`Escolher arquivo`), and a muted footnote row: `· OFX 1.x e 2.x`,
`· até 5 MB`, `· 100% local`.

**The design says "até 10 MB". The route's cap is 5 MB.** Write 5, not 10 — the
copy has to match the code, and the code is not changing.

The drop target must not be the only way in: the `FilePicker` button stays, is
keyboard-reachable, and is what a screen-reader user will use. Do not add
`tabIndex` or a click handler to the panel itself; a focusable div that opens a
file dialog is worse than the button already there.

`hook.test.ts`: `onDrop` with one file calls `onFile` once with it; with
several, calls it once with the first; with none, does not call it;
`disabled` suppresses both `onDrop` and the `over` state. Build the events as
plain objects (`{ preventDefault: vi.fn(), dataTransfer: { files: [file] } }`) —
Vitest runs in the node environment with no jsdom, and these handlers are plain
functions, so no DOM is needed.

### 3. `LoadingCard`
```tsx
<SectionCard title="Lendo arquivo" icon={FileUp}>
  <p className={styles.file}>{fileName}</p>
  <div className={styles.bar} role="progressbar" aria-label="Lendo o arquivo">
    <div className={styles.pulse} />
  </div>
  <div className={styles.skeleton} aria-hidden>
    {SKELETON_WIDTHS.map((w) => <div key={w} className={styles.line} style={{ width: `${w}%` }} />)}
  </div>
</SectionCard>
```
`SKELETON_WIDTHS = [92, 78, 85, 64, 71]` — the design's own, a module constant,
not five hand-written divs.

The bar is **indeterminate**: `role="progressbar"` with no `aria-valuenow`,
which is exactly how indeterminate is expressed. A `@keyframes` sweep on
`.pulse` with `animation-duration: var(--duration-slow)`-derived timing — and
because `prefers-reduced-motion` collapses every duration token to `0ms`, add an
explicit `@media (prefers-reduced-motion: reduce) { .pulse { animation: none; width: 100%; } }`
so it degrades to a static filled bar rather than a zero-length flicker. **Never
write a literal duration**; a raw `1.2s` silently opts out of the OS preference
and nothing in this repo catches it.

Skeleton lines: `height: 14px`, `background: var(--color-border-subtle)`,
`border-radius: var(--radius-sm)`. `aria-hidden` on the whole block — the
progressbar already announces the state; five decorative bars announcing nothing
is noise.

### 4. `ReportView`
Structure stays: file name, facts `<dl>`, account lines, the table, the error
line, the actions. Changes:

**The badge.** In the card's header area, a pill reading
`{totals.count} lançamentos lidos` with a `Check` glyph:
`background: var(--color-positive)`, `color: var(--ink-900)`, `--radius-sm`,
`--text-xs`, `--weight-bold`. Add `count` to `useReportView`'s return (it
already computes `count` as a string for the facts row — reuse it rather than
formatting the number twice).

**The metadata row.** The design shows five: `INSTITUIÇÃO`, `CONTA`, `PERÍODO`,
`MOEDA`, `SALDO FINAL`. Today's `<dl>` has four (`Instituição`, `Período`,
`Moeda`, `Lançamentos`). Restyle the keys to `--font-display`, `--text-2xs`,
`--tracking-wide`, muted; values at `--text-base`, `tabular-nums`. Drop
`Lançamentos` — the badge now carries it — and add:
- `CONTA` — `accounts[0]?.accountId`, or `"—"`. With more than one account,
  append ` +${accounts.length - 1}` so nothing is hidden; the account lines
  below still list them all.
- `SALDO FINAL` — the last non-null `balanceCents` across `accounts`, through
  `formatMoney`, or `"—"`. Every `OfxAccount` field is nullable; do not assume
  one is set.

`useReportView`'s existing assertions use `toMatchObject`, so **adding** fields
is safe. Extend `hook.test.ts` with the two new ones, including the all-null
account case and the multi-account case.

**The table.** Keep the semantics exactly — `<caption>`, `<thead>` with
`scope="col"`, `<th scope="row">` per month, `<tfoot>` totals, and the
`.tableWrap { overflow-x: auto }` that keeps the page body from scrolling.
Restyle: header cells `--font-display`, `--text-2xs`, `--tracking-wide`, muted,
with `border-bottom: var(--border-2) solid var(--color-border)`; body rows
`--border-1 solid var(--color-border-subtle)` and a
`background: var(--color-surface-raised)` hover; the totals row keeps its
`--border-2` top rule and bold weight. Add `min-width: 560px` to the table so
the columns stay readable inside the scroller at 375px.

**Do not touch the 44px copy-button column.** `MonthRow` reserves `flex: 0 0 44px`
for `CopyButton` and `TotalsRow` mirrors it with
`padding-inline-end: calc(44px + var(--space-2) + var(--space-3))`. Those two
numbers are coupled; change one and the totals stop lining up with the columns
above. If you change the cell padding, change both together and re-check
visually.

`CopyButton` itself is untouched. Its `aria-live` region is **the only one in
the repo** and must stay rendered and not `display: none` — `visibility: hidden`
kills the announcement too, and unmounting it stops announcements silently.

**The actions.** Ghost `Fechar` + `FilePicker` labelled `Trocar arquivo`, both
disabled while loading, wrapping on narrow screens. `Trocar arquivo` uses the
primary treatment (it is the affirmative action). No third button.

The `▲` error line stays, in `--color-negative` — and note it must survive
`Trocar arquivo` failing: the current report stays on screen with the error
shown, which is the whole reason it is a separate button from `Fechar`.

### 5. `FilePicker` — style only
Keep the hidden `<input type="file" accept=".ofx,text/plain">` using the
`hidden` attribute (not `display: none`): it stays out of the tab order and the
accessibility tree, leaving the `Button` as the single accessible control. Keep
the `event.target.value = ""` reset after each pick — without it, picking the
*same* file twice fires no `change` event and `Trocar arquivo` silently does
nothing the second time.

### Verify
Run from inside the task worktree, never the main checkout:

```bash
npm install && npm run db:setup && npm run lint && npx vitest run --exclude '**/.claude/**' && npx tsc --noEmit && npm run build
```

Baselines: lint **2 errors + 1 info**, tsc **1 error**, test **45 files / 321
tests** plus whatever earlier tasks added — re-measure on the merged `main`.
Never run `npm run lint:fix`.

`ReportView/index.tsx` sits at 83 effective lines against the 100 cap — the
badge and two extra facts will eat most of the headroom. Count by hand; if it
goes over, extract the header block (badge + file name + facts) into a child
component rather than squeezing.

### Browser check
Start the dev server from inside the worktree on a spare port and
`preview_start` with `{url: "http://localhost:<port>"}`. Use the synthetic
fixture from `src/app/api/ofx/fixtures.helper.ts`, written to a `.ofx` file
**outside** the repo.

- Idle: the dashed dropzone renders with the footnote row saying **5 MB**.
- Drag a file over it: the panel lights up (`--color-brand` border, raised
  background). Drag out: it reverts.
- **Drop the file**: the loading card appears with the file name, then the
  report. Confirm `POST /api/ofx` actually fired via `read_network_requests` —
  a `computer` drag may report success while doing nothing, and the request log
  is the only proof.
- Drop a `.txt`: the error line appears and the screen returns to the dropzone,
  not a stuck loading card.
- Drop the file onto the browser **outside** the zone: the page must not
  navigate away. If it does, a `preventDefault` is missing.
- Picking from the button still works, and picking the **same** file twice in a
  row still re-parses.
- Report: the badge count equals the table's `Lanç.` total; `CONTA` and
  `SALDO FINAL` match the account lines; the copy buttons still copy `4312,50`
  and still announce.
- Reload: the report survives (`sessionStorage`). `Fechar`: the dropzone
  returns and `sessionStorage.getItem("ofx-report")` is `null` — read it in a
  **separate** `javascript_tool` call from the click, because state read in the
  same call reports the PRE-change value.
- `Trocar arquivo` with a rejected file: the previous report **stays on screen**
  with the error visible.
- Both themes; at 375px the table scrolls inside `.tableWrap` and the page body
  does not; the action buttons wrap.
- Force `prefers-reduced-motion`: the progress bar is a static filled bar, not a
  flicker.
- No console error.

If the drag-and-drop cannot be driven by the `computer` tool at all, fall back
to `javascript_tool`: build a `DataTransfer`, attach the file, and dispatch
`dragover` / `drop` events on the zone. Do not skip the check.

### Anything else you touch
No change to `src/app/api/ofx/**` — not the route, not the service, not the
parser, not the 5 MB cap, not the error codes. No change to `session.helper.ts`,
`copy-text.helper.ts` or `CopyButton`. `src/lib/api.ts` is not edited.
