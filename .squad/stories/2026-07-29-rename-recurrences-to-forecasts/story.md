# Rename recurrences to forecasts

## Why
"Recorrência" names the mechanism — it repeats — not what the number is: money
nobody has spent yet. Sitting next to real movements on the dashboard, the two
read as equally settled, so the owner reads a projection as a fact. The word
has to say "previsão" everywhere, from the nav down to the table name.

## Acceptance Criteria
- [ ] Nav reads "Previsões", the screen lives at `/previsoes`, and no text a
      user can read anywhere in the app still says "recorrência"/"recorrente".
- [ ] The 5 forecasts and 76 month rows already in `dev.db` survive: same names,
      same values, same active months, still listed and still feeding the
      dashboard's ceiling and global period.
- [ ] CRUD lives at `/api/forecasts`; no table, type, folder, file or symbol in
      the repo is still named `Recurrence`/`recurrence` (old migration folders
      excepted — history is immutable).
- [ ] Nothing else changed: no field added or removed, no rule, no number.

## Definition of Done
- [ ] `npm run lint` clean
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run build` succeeds
- [ ] `npm run test` green
- [ ] `sqlite3 dev.db "SELECT count(*) FROM Forecast; SELECT count(*) FROM ForecastMonth;"`
      prints `5` then `76`
- [ ] `grep -rniE "recurren|recorrenc" --include="*.ts" --include="*.tsx" \
      --include="*.scss" --include="*.prisma" --include="*.json" src/ e2e/ \
      prisma/schema.prisma package.json` returns nothing

## Tasks
- [x] tasks/01-drop-stale-nav-assertion.md — unrelated red spec left by the installments revert, fixed first so the suite is a usable baseline
- [x] tasks/02-rename-forecast-tables.md — Prisma models + hand-written data-preserving SQLite migration
- [ ] tasks/03-rename-forecast-domain-and-api.md — entity, repository, `/api/forecasts`, and every backend consumer
- [ ] tasks/04-rename-forecast-ui.md — `/previsoes` screen, nav, form, and the Portuguese copy
- [ ] tasks/05-realign-e2e-to-forecasts.md — specs and helpers back to green on the new names
