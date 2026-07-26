# OFX reader — monthly totals from a bank statement, without touching the DB

## Description
Filling in **Movimentações** means reading a bank statement and typing the
month's income and expense totals by hand. The bank already publishes those
numbers in a machine-readable form — an OFX export — so this story turns that
file into the two numbers per month the owner actually needs to type.

A new sidebar entry, **Leitor OFX** (`/leitor-ofx`), accepts an OFX file, posts
it to a new `POST /api/ofx`, and renders what comes back. The endpoint is
**stateless**: it parses the upload in memory and returns JSON. Nothing is
written to SQLite, no repository is touched, no migration exists. The response
is cached in `sessionStorage` so a page reload keeps the report on screen —
and a new tab, or a closed tab, starts empty. This is the first `sessionStorage`
user in the repo, and the first multipart route.

What the screen shows, top to bottom:

1. **A metadata header**, so the owner knows which file they are looking at:
   file name, institution (`<ORG>`/`<FID>`), currency, the covered period, the
   transaction count, and one line per account found in the file (bank id,
   account id, type, ledger balance and the month it refers to).
2. **A monthly table** — the report proper. One row per month from the period
   start to the period end **inclusive, zero-filled**, with entradas, saídas,
   saldo and the number of transactions, ascending, plus a totals row.
3. **A copy button on each entradas and saídas value**, putting `4312,50` on
   the clipboard — the exact format `MoneyInput` accepts on paste. This is the
   whole point of the screen: read a row, paste it into Movimentações.
4. **Two buttons at the end** — `Fechar` drops the report and clears the
   session key; `Trocar arquivo` opens the file picker and replaces the current
   report, keeping it on screen if the new file fails to parse.

### Decisions taken during refinement (do not re-litigate)
- **Monthly totals only.** No per-transaction list, no "top expenses". The
  screen answers one question.
- **Checking-account statements only** (`<STMTRS>`). Credit-card blocks
  (`<CCSTMTRS>`) are deliberately ignored; a file containing only card blocks
  gets an explicit error saying so rather than an empty report.
- **Direction comes from the sign of `<TRNAMT>`**, unconditionally. Positive is
  entrada, negative is saída. No per-bank heuristic — a heuristic that guesses
  wrong is worse than a rule the owner can predict.
- **A file with several accounts is summed into one report**; the header lists
  every account it found, so nothing is dropped silently.
- **Empty months inside the period are rendered as zero rows**, so a gap in the
  statement is visible rather than absent.
- **Both OFX 1.x (SGML) and 2.x (XML) are supported** — the same tolerant tag
  scanner reads both, since 1.x closes its aggregates even though it omits leaf
  closing tags.
- **This screen introduces the repo's first `<table>`.** Every other list here
  is a `<ul>` of flex rows, which cannot align columns; a five-column numeric
  report is genuinely tabular and gets real table semantics.

## Acceptance Criteria
- [ ] A **Leitor OFX** item appears in the sidebar's top group after
      Recorrências, links to `/leitor-ofx`, and takes the active style on it.
- [ ] With nothing loaded, `/leitor-ofx` shows a single upload card; picking a
      valid OFX bank statement replaces it with the report.
- [ ] The report header shows the file name, institution, currency, period
      (`Jan/26 – Jul/26`), total transaction count, and one line per account
      with its bank id, account id, type and ledger balance.
- [ ] The table lists **every** month from the period start to the period end
      inclusive, ascending, with `0,00` rows where the statement has no
      transaction, and a totals row summing the columns.
- [ ] Entradas equals the sum of positive `<TRNAMT>` and saídas the absolute
      sum of negative ones, per month — verified against a fixture whose totals
      are known.
- [ ] A file holding two accounts produces one table summing both, and a header
      listing both accounts.
- [ ] Each non-zero entradas and saídas value has a copy button that puts the
      ungrouped, unsigned `4312,50` form on the clipboard and confirms it
      visibly; a clipboard failure is reported, never silent.
- [ ] Reloading the page keeps the report; opening `/leitor-ofx` in a new tab
      shows the upload card.
- [ ] `Fechar` returns the screen to the upload card and removes the
      `sessionStorage` entry (verified in devtools, not just visually).
- [ ] `Trocar arquivo` opens the picker and swaps the report on success; on a
      rejected file the previous report stays on screen with the error shown.
- [ ] Each of these is refused with its own message, and none of them crashes
      the route: a file that is not OFX, a card-only OFX, an OFX with zero
      transactions, an empty file, a file over 5 MB, and a POST with no `file`
      field at all.
- [ ] An OFX encoded in ISO-8859-1 renders accented names correctly (this is
      the common case for Brazilian banks).
- [ ] Nothing is persisted: after parsing a statement, Movimentações,
      Recorrências and the Dashboard are unchanged, and `prisma/schema.prisma`
      has no diff.

## Definition of Done
- [ ] `npm run lint` reports **no NEW** errors versus the pre-change baseline of
      **2 errors + 1 info** — both errors in `.design-sync/gen-cards.mjs`
      (`organizeImports` + `format`), the info being the deprecated
      `recommended` field in `biome.json`. Do not "fix" them and never run
      `npm run lint:fix`, which rewrites the whole repo.
- [ ] `npx tsc --noEmit` reports **no NEW** errors versus the pre-change
      baseline of **1 error**: `ThemeToggle/theme.helper.test.ts(21,22)
      TS2345`. Disclose this baseline in the PR body with the same words used
      for lint — a body that discloses one gate's baseline and says only "zero
      new errors" for another reads as selective.
- [ ] `npm run test` green, measured **from inside the task worktree**.
      Pre-change baseline: **33 files / 237 tests**. A run from the main
      checkout globs `.claude/worktrees/*` and counts other branches' tests.
- [ ] `npm run build` succeeds.
- [ ] The 100-line-per-file cap holds for every new file. Correcting what this
      story originally claimed: `noExcessiveLinesPerFile` **does** fire, but
      only on `.ts` — it is silent on `.tsx`, which is why `EntryScreen/index.tsx`
      (109 lines) has never been flagged. On `.ts` it reports at `info`
      severity, so it does **not** fail `npm run lint`; read the `Found N infos`
      line against the baseline of 1. On `.tsx`, count by hand — nothing will
      tell you.
- [ ] Verified live in the browser preview with a real OFX export, in light and
      dark theme, at desktop width and at 375px, with no console error.
- [ ] Every OFX fixture committed to the repo is synthetic — no real account
      number, balance or holder name. Fixtures under `src/` are **not**
      gitignored.

## Tasks
- [x] tasks/01-ofx-api.md — the OFX parser and the stateless
      `POST /api/ofx` route, with the tag/amount/date primitives tested
- [ ] tasks/02-ofx-screen.md — the `/leitor-ofx` screen: nav entry, upload,
      sessionStorage lifecycle, metadata header, monthly table, two buttons
- [ ] tasks/03-copy-value.md — the per-value copy-to-clipboard button on the
      entradas and saídas cells
