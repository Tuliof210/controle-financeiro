# Dashboard v2: the imported design's skin

## Why
The dashboard carries every number the owner asked for, in cards that all look
alike. An imported design re-skins the board — `design.html`, beside this file,
is the contract; cite it by line. No new data.

## Acceptance Criteria
- [ ] `/` opens on one full-bleed dark band holding PAINEL / Dashboard / the
      subtitle AND the projected balance, its delta chip and the three facts —
      no PageHeader above it. The other five routes keep theirs unchanged.
- [ ] Every board card wears a filled header band — positive, negative and brand
      on the KPIs, inverted ink on the charts and on Teto — and casts the repo's
      hard offset shadow, which `src/styles/README.md` rule 3 admits first.
- [ ] A KPI card reads: total, caption, a 2x2 grid of realizado / média / mediana
      / desvio, and a full-width sparkline strip on its bottom edge.
- [ ] The bars sit on a shaded band from the first projected month, split by a
      dashed rule; the cumulative line marks the month Teto calls its bottleneck.
- [ ] Teto splits into a summary pane beside the month table, the cap selector
      rides the band, and each row shows what share of its balance it spends.
- [ ] The savings block is accent-filled and each goal metric gets a bar.
- [ ] Both themes read, and `/` overflows nothing at 375/767/768/1024/1440.

## Definition of Done
- [ ] `npm run lint` exits 0, still 5 infos
- [ ] `wc -l` shows no touched file over 100 — `.scss` included (Biome never reads
      them), and `HeroCard/style.module.scss` starts at 158
- [ ] `npm run build` succeeds
- [ ] `npm test` green, with `/` in `e2e/row-overflow.spec.ts`'s `ROUTES`

## Tasks
- [x] tasks/01-card-band.md — SectionCard's filled band + hard shadow, rule 3's
      third exception, proved on the three KPI cards
- [x] tasks/02-hero-band.md — the full-bleed hero absorbs PageHeader on `/`
- [x] tasks/03-chart-cards.md — ink bands, legends, projected band, bottleneck mark
- [x] tasks/04-ceiling-split.md — Teto's ink band and its two-pane split
- [x] tasks/05-ceiling-row-bar.md — the per-row share bar in the month table
- [x] tasks/06-savings-block.md — the accent banner and the goal metric bars
- [ ] tasks/07-overflow-guard.md — `/` joins the overflow spec; the 1024px
      tooltip spill blocking it closes
