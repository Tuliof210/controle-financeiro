# Simulated forecasts

## Why
Asking "what would the next twelve months look like if I financed this car?"
today means editing real forecasts and remembering to undo them. There is no
way to try a scenario without polluting the numbers the household relies on.

## Acceptance Criteria
- [ ] The forecast form (add and edit) has a "Simulação" checkbox. Everything
      else about registering a forecast is unchanged — pontual or range of
      months, entrada or saída, owner.
- [ ] Saving a checked forecast and reopening it for edit shows it still checked.
- [ ] A simulated forecast is marked "SIMULADO" on its row in `/previsoes`.
      That screen always lists real and simulated forecasts together.
- [ ] The dashboard has its own selector above the hero band with two options:
      "Apenas dados reais" (default) and "Incluir simulações".
- [ ] On "Apenas dados reais", every dashboard figure — the hero band, both
      KPI rows, both charts, Teto de Gastos, Capacidade de Poupança, the goal
      projections, and the derived period — is computed as if simulated
      forecasts did not exist.
- [ ] On "Incluir simulações", simulated forecasts are summed exactly like real
      ones, with no other difference.
- [ ] The selector's choice survives a reload; a browser that never chose starts
      on "Apenas dados reais".
- [ ] Every forecast that existed before this story reads as real.

## Definition of Done
- [ ] `npm run lint` exits 0
- [ ] `npm run test` green
- [ ] `npm run build` succeeds

## Tasks
- [x] tasks/01-simulated-flag-data-layer.md — the `simulated` column, end to end through the forecasts API
- [x] tasks/02-simulation-checkbox.md — the styled checkbox in the forecast form
- [x] tasks/03-simulated-badge.md — the "SIMULADO" mark on a forecast row
- [ ] tasks/04-dashboard-api-simulation-filter.md — `/api/dashboard` learns to exclude simulated forecasts
- [ ] tasks/05-dashboard-simulation-select.md — the selector above the hero band, persisted
- [ ] tasks/06-e2e-simulated-forecasts.md — one spec covering the round trip and the dashboard swing
