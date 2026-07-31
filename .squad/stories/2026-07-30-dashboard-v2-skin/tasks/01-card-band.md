# The filled header band, proved on the three KPI cards

## Outcome
- `SectionCard` takes an optional filled header band. A card that asks for one
  puts its icon, title, hint trigger and `headerEnd` on a solid fill running the
  card's full width, closed by a `--border-2` rule against the body. A card that
  does not ask is byte-identical to today — all 8 non-dashboard call sites
  included.
- A card with a band also casts the repo's hard offset shadow, and
  `src/styles/README.md` rule 3 admits that exception in the same commit.
- Entradas / Saídas / Saldo each show: the band (positive / negative / brand
  fill), the total and its caption, a 2x2 grid of REALIZADO · MÉDIA/MÊS ·
  MEDIANA · DESVIO PADRÃO, and a full-width sparkline strip on the card's
  bottom edge, separated by a `--border-1` rule.

## Context
The design is `design.html` beside this task. The KPI card is lines **205-244**
(band 206-217, body 218-239, sparkline 240-243); the other two are the same
shape at 246-285 and 287-328.

**`SectionCardProps` today** (`src/components/SectionCard/hook.ts`), verbatim:
```ts
export type SectionCardProps = {
  title: string;
  icon?: LucideIcon;
  tone?: "positive" | "negative";
  hint?: string;
  headerEnd?: ReactNode;
  children: ReactNode;
};
```
`tone` stays and keeps doing what it does for the 8 outside call sites — the band
is a separate, additive prop. Two traps in that stylesheet, both commented there:
`styles[tone]` is a **CSS-Modules string lookup**, so renaming `.positive` /
`.negative` kills the tint with no compile error and no test; and *"No
`overflow: hidden` here, ever"* — the Tooltip trigger's focus ring is an outline
with `outline-offset` and an overflow ancestor clips it on all 13 cards at once.
The design puts `overflow:hidden` on the card (line 205) to clip a 4px radius.
**Do not copy it.** `.title` uses `text-transform`, never uppercased strings —
the titles are read verbatim as Tooltip labels.

**The shadow.** `@include t.elevation(press)` = `3px 3px 0 var(--color-border)`,
themed through the border it echoes. The design draws `5px 5px 0`; 5 is not on
the 4px scale and no 5px token exists, so the existing token wins — the same way
`CapSelector` recorded *"The design draws a shorter chip; the floor wins."*
Rule 3 currently reads *"the three hard offset shadows … are scoped to exactly
two things"* and has already been amended twice ("as amended"). Amend it a third
time, naming the band as the trigger, not "dashboard cards" — the rule has to
stay a rule about the DS, not about one screen.

**The band fills** are `--color-positive`, `--color-negative`, `--color-brand`.
Contrast is a property of the pair, never inferable from the fill's hue: measure
the foreground you pick against each of the three fills in **both** themes before
shipping, and leave the measured ratios in a comment the way
`src/components/EntryRow/style.module.scss:9-22` does for its seven fills. The
band also hosts the hint trigger — check its focus ring is visible on the fill.

**The 2x2 grid** replaces the current one-column `<dl>` in
`StatCard/index.tsx`; keep the `<dt>`/`<dd>` pairing, `Headline` above it, and
`aria-hidden` on the sparkline (*"the four rows below already carry every number
the sparkline shows"*). `spark.helper.ts` exports `SPARK_W` / `SPARK_H` and the
path builder — the strip is now full-bleed inside the card, so it needs
`preserveAspectRatio="none"` and a width driven by CSS, not by `SPARK_W`.
`StatCard/style.module.scss` is 78 lines: there is room, but check.

Grids use `minmax(0, 1fr)`, never a bare `1fr` — stated twice in this tree,
because `1fr` is `minmax(auto, 1fr)` and reopens horizontal overflow at 375px.

## Scope
- In: `src/components/SectionCard/**`, `src/styles/README.md`,
  `src/app/_components/DashboardScreen/components/StatCard/**`, and
  `Overview/index.tsx` + `style.module.scss` only if the band prop must be
  passed from there.
- Out: the other 8 SectionCard call sites, `Headline/`, `_tokens.scss` (every
  token this needs already exists), the charts, Teto, the savings block.

## Verify
- `npm run lint`; `wc -l` every touched file, `.scss` included.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100.
- In the browser preview at 375, 767, 768, 1024 and 1440: read the three cards in
  both themes; confirm the band spans the full card width with no gap at the
  corners, the sparkline sits flush on the bottom edge, and the 2x2 grid does not
  wrap a figure.
- Tab to a hint trigger inside a band and confirm the focus ring is not clipped.
- Open `/configuracoes` and `/leitor-ofx` and confirm their cards are unchanged.

## Forbidden
- No `overflow: hidden` anywhere in the card's ancestor chain.
- No new token, no raw colour, no raw px shadow, no radius above `--radius-md`.
- Do not remove or repurpose `tone` — 8 call sites outside the dashboard read it.
- Do not touch the KPI figures, their order, or their labels.
