# Import a whole OFX statement into Movimentações in one click

## Why
The OFX reader turns a statement into monthly income/expense totals, then hands them
over one clipboard copy at a time — the owner re-types every month by hand on
Movimentações. A twelve-month statement is twenty-four manual round trips to move data
the app already computed and already knows how to store.

## Acceptance Criteria
- [ ] The per-cell copy buttons are gone from the monthly table
- [ ] One "Importar" button opens a confirmation dialog holding a free-text document
      identifier (pre-filled from the account), a person select, and a count of what
      will be created
- [ ] Confirming creates one movement per non-zero monthly income and expense across
      every month of the report, named `Entrada|Saída <identificador> <Mmm/AA>`
- [ ] The created movements appear on `/movimentacoes` after navigating there
- [ ] A failed import creates nothing at all — no partial batch, no recorded file
- [ ] Re-opening a file that was already imported leaves the button disabled, with a
      tooltip saying so
- [ ] A different file whose months overlap an earlier import still imports

## Definition of Done
- [ ] `npm run test` green, including a spec that drives upload → dialog → import and
      then proves the button is disabled for the same file
- [ ] `npm run lint` and `npm run build` green
- [ ] `npm run db:setup` applies the new migration on a fresh checkout
- [ ] `src/app/leitor-ofx/**/CopyButton/` no longer exists and nothing imports it
- [ ] `wc -l` on every file created or touched is <= 100

## Tasks
- [x] tasks/01-ofx-import-endpoint.md — OfxImport table, repository and the
      all-or-nothing bulk endpoint
- [x] tasks/02-report-file-hash.md — the reader returns a SHA-256 of the uploaded file
- [ ] tasks/03-drop-copy-buttons.md — delete the per-cell copy affordance
- [ ] tasks/04-import-action.md — the Importar button and its confirmation dialog
- [ ] tasks/05-import-e2e-spec.md — end-to-end proof of the import and the re-import lock
