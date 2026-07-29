# Monevo row redesign

## Why
The owner approved a Claude Design revision (`Monevo.dc.html`) whose rows read
nothing like the shipped ones: identity is a filled chip, the owner and the
period collapse into one muted line under the name, and a recurrence's coverage
bar runs the full width of its row. Today's rows still spread five cells across
list-wide shared columns, which the design abandons entirely.

## Acceptance Criteria
- [x] A Movimentações / Recorrências row shows: a square chip filled with the
      owner's colour carrying their initial, the name on one line, and
      `Owner · Period` on a smaller muted line beneath it.
- [x] The amount sits flush at the row's right edge, one step larger than the
      name, tinted green for entradas and red for saídas.
- [x] A recurrence row draws its coverage bar as a thin full-width band across
      the bottom of the row; the interval text reads in the metadata line, and a
      row with no saved global period draws no band and no empty gap for one.
- [x] Row action buttons paint smaller than today, yet every one still answers a
      44×44 tap and a tap can never trigger the neighbouring action.
- [x] Pessoas and Objetivos rows use the same row anatomy and the same buttons.
- [x] At 375 / 768 / 1024 px no page scrolls sideways, both action buttons stay
      inside their row, and the name never collapses below a readable width.

## Definition of Done
- [x] `npm run lint` exits 0.
- [x] `npm run test` is green — requires **no `next dev` running in this
      directory** (Next 16 refuses a second one per directory).
- [ ] Browser preview of `/movimentacoes`, `/recorrencias` and `/configuracoes`
      at 1440 / 768 / 375 px, in both themes, screenshotted on the PR.
      NOT DONE: the preview was walked and its measurements are on the PR, but
      attaching images needs GitHub's web upload — `gh` has no endpoint for it,
      so this box cannot be closed from the command line. Owner's call.

## Tasks
- [x] tasks/01-icon-button-compact.md — a size knob on IconButton that shrinks
      the paint without shrinking the tap
- [x] tasks/02-entry-row-areas.md — replace RowGrid's shared columns with the
      design's per-row grid areas, chip and metadata line
- [x] tasks/03-coverage-bar-band.md — split the recurrence period into metadata
      text plus a full-width band, and open the seam that carries it
- [x] tasks/04-settings-rows.md — Pessoas and Objetivos onto the same anatomy
