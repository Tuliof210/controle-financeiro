# Vigência card for the forecast interval list

## Why
The forecast form's interval editor works but looks unfinished: bare month/year
selects float in the modal with no container, no duration read-out, and the
"Mês único" checkbox is the browser's default box. Design `1c` of the Claude
Design project "Seletor de Vigência" is the approved target.

## Acceptance Criteria
- [ ] Every interval row renders as a bordered card on `--color-surface`:
      header with a `VIGÊNCIA` eyebrow, the `Mês único` toggle, and (only when
      more than one row exists) a remove control.
- [ ] Each card ends in a summary strip on `--color-surface-raised` showing the
      month range on the left and a duration badge (`1 MÊS` / `N MESES`,
      inverted: `--color-text` fill, `--color-bg` text) on the right.
- [ ] `Adicionar intervalo` is one dashed full-width button below all cards.
- [ ] Month/year selects render the DS caret instead of the native arrow, in
      both themes, on `/previsoes`, `/movimentacoes` and `/configuracoes`.
- [ ] `Mês único` still exposes role `checkbox` with accessible name
      `Mês único`, and still hides the `Fim` picker when checked — behaviour is
      unchanged, only the appearance changes.
- [ ] No horizontal overflow at 375px with the forecast modal open, and every
      interactive control still answers a 44px tap.

## Definition of Done
- [ ] `npm run lint` exits 0
- [ ] `npm run test` — all specs green, `interval-lock.spec.ts` included
- [ ] Visual check in the browser pane, light and dark, at 375px and 1280px

## Tasks
- [x] tasks/01-select-skin.md — shared DS select skin (caret + sizing) for
      `MonthPicker` and `SelectField`
- [x] tasks/02-vigencia-card.md — card shell, header with the `VIGÊNCIA` eyebrow,
      styled `Mês único` toggle, relocated remove control, dashed add button
- [x] tasks/03-summary-strip.md — month range and inverted duration badge
- [ ] tasks/04-e2e-vigencia-card.md — extend `interval-lock.spec.ts` with the
      card's visible read-outs, overflow and hit-target checks
