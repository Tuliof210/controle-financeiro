---
target: src/app/_components/DashboardScreen
total_score: 26
p0_count: 0
p1_count: 3
timestamp: 2026-08-13T15-23-36Z
slug: src-app-components-dashboardscreen
---
Method: dual-agent (A: ab28c6818ad17d768 · B: a9dcbca197207c468)

Target: `src/app/_components/DashboardScreen` — 169 files, 8,429 lines, rendered live at
http://localhost:3000/ against a populated DB (Jan/26→Dez/28, 3 goals, 29 ceiling months).
Both themes, 1280 and 375, inspected. Empty/`no_range` state was NOT exercised — the DB has data.

**Provenance caveat.** The two agents shared one browser pane. Agent B's injection preflight
rewrote `document.title` to `IMPECCABLE-SENTINEL-B-4471` and flipped `data-theme` mid-run, which
contaminated Agent A's first two screenshots. A moved to an isolated tab and re-took everything.
Neither string exists in the repo (grep over `src/` and `public/` is clean) — this was tool
crosstalk, not app code and not injected instructions. Findings below are from the clean re-run.

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | `aria-busy` + dim + `cursor: progress` on cap change is thoughtful; but `querySelectorAll('[aria-live]')` returns **empty** — ~40 figures swap silently for AT |
| 2 | Match System / Real World | 3 | "Teto de Gastos", "Gasto extra este mês", "Sobra" are excellent domain pt-BR; the cap's "25% / 50% / 75%" are percentages of an unnamed quantity (its `<legend>` is `clip-path: inset(50%)`) |
| 3 | User Control and Freedom | 3 | Nothing destructive, `ShowAllToggle` reversible; but the cap resets to 50% every reload and the error state has no retry |
| 4 | Consistency and Standards | 2 | Weakest axis. Hero eyebrows in Clash Display vs mono everywhere else (measured); "current month" painted ink in one place and positive-green in another *inside the same card*; square swatch/badge against the 6px rule; segmented control diverges from its own documented recipe |
| 5 | Error Prevention | 3 | `heldFor()` profile-tagging (one person's money never renders under another's name) and the out-of-order-response guard are real prevention; offset by the cap's silent trade-off |
| 6 | Recognition Rather Than Recall | 2 | Four unlabelled percentage options; "Saldo acum." vs "Teto do mês" vs "Sobra" needs a 687-character hover tooltip to decode |
| 7 | Flexibility and Efficiency | 3 | Native radios (arrow keys free), keyboard-scrollable chart regions, a real `<table>`; no shortcuts, no saved lens, no anchor to the ceiling |
| 8 | Aesthetic and Minimalist Design | 2 | Beautiful cold-paper craft carrying ~90 numbers, 48 shouted labels, 15 KPI statistics and two decorative sparklines |
| 9 | Error Recovery | 2 | The error `Notice` prints the message and offers no retry — recovery is a manual page reload |
| 10 | Help and Documentation | 3 | Every card has a hint and the tooltip is a genuine WCAG 1.4.13 implementation; but `HINTS.ceiling` is 687 characters in a hover bubble |
| **Total** | | **26/40** | **Acceptable — significant improvements needed** |

P0: 0 · P1: 3 · P2: 2

---

## Anti-Patterns Verdict

**Does this look AI-generated? No — and the evidence is unusually strong.** This is a
hand-reasoned system. `chart-marks.config.ts` records that `--color-surface-raised` over
`--color-surface` measures ~1.13:1 and therefore cannot be the projection signal, so it adds a
dashed contour that survives greyscale. `MoneyFigure/style.module.scss` rejects the design's 0.45
cents opacity because it "composites to ~3.1:1 … under rule 7's 4.5:1 floor". `_stacked.scss`
documents a re-measured container threshold (799px → 450px intrinsic, so 839 → 489). Nobody fakes
that.

**But it fails its own constitution in three ways an operator will feel without being able to name
them:**

- **Generic SaaS dashboard — hit, twice.** Three near-identical KPI cards (icon-in-tinted-square →
  mono eyebrow → big coloured money → 2×2 statistics grid → decorative sparkline). DESIGN.md §6
  bans "four identical icon-and-number KPI cards"; shipping three is not an exemption. The
  sparklines are `aria-hidden` with no axis, no scale, no labels, restating numbers printed
  directly above them — chart-because-dashboards-have-charts, by the system's own definition.
- **Cobalt marks everything except an action.** 67 cobalt-painted elements measured live, from at
  least ten distinct decisions beyond the four DESIGN.md permits — and **zero primary actions on
  the page.** The system's own strapline is "one cobalt signal marks the only thing you can act
  on."
- **Both documented exceptions have metastasised.** `HeroBand/style.module.scss` asserts it is
  "the only surface on the dashboard that flips, which is what makes it read as the headline rather
  than a fourth card." That comment is false in shipped code: `ChartCard/index.tsx:17` and
  `CeilingCard/index.tsx:38` both pass `band="ink"`, and ChartCard renders twice — **four inverted
  ink surfaces on one page.** The mono eyebrow is on 48 labels.

Clean against: Brazilian bank-app house style (no promo cards, banners, cross-sell, marketing
voice), gamified finance (no mascots, streaks, confetti, emoji), gradient text, glassmorphism,
side-stripe borders >1px, text overflow (`documentElement.scrollWidth 375 === clientWidth 375`).

**Deterministic scan.** `detect.mjs` on the target: **0 findings, exit 0.** Widened to `src`: 1
finding, and it is outside the target (`src/components/AppShell/components/Aside/style.module.scss:29`,
`transition: width`, sidebar collapse, fires on every route). The detector was verified live —
same invocation surfaces the AppShell finding when scope widens, so the zero is a real clean, not
an empty file list.

The in-page injected detector found 11 on a clean dark load, 15 at 375px. Adjudicated:

| Finding | Verdict |
|---|---|
| `gpt-thin-border-wide-shadow` ×7 | **False positive.** All 7 are closed `Tooltip` `.bubble`s (`visibility: hidden`). `src/styles/README.md` rule 3 reserves the blur shadow for floating layers; a popover is exactly that. Outside the target tree. |
| `low-contrast` ×84 | **Artifact.** Fires only after `data-theme` is flipped by JS in a loaded page; a clean load reports 0. All 84 read `#f8f9fb on #ffffff` — visx axis text carries `fill="var(--color-text-muted)"` as a presentation attribute and the detector resolves that `var()` against a stale snapshot. Computed fill is `rgb(76,84,96)` = **7.65:1**. |
| `content overflowing its container` ×4 (375px) | **False positive.** The escapers are deliberate full-bleed: `section.band`, `div.edge`, `div.glow`, and `svg.plot` (1352px inside a horizontally-scrollable region). |
| `wide-tracking` on `h2.eyebrow` | **False positive.** IBM Plex Mono, 12px, `letter-spacing: 1.68px` (0.14em), uppercase — the sanctioned eyebrow case, README rule 4. |
| `tiny-text` ×2 (11px) | **Real measurement, no rule exempts it.** Both resolve from `--text-2xs`, not a hardcoded px. `p.eyebrow "SALDO PROJETADO · Dez/28"` and `span.note "sólida = realizado · tracejada = projeção"`. |
| `layout-transition` | Real, but AppShell, not this target. |

**The detector caught nothing here that the review missed, and the review caught five things the
detector cannot see.** That asymmetry is the story: this codebase passes every mechanical gate it
owns — `tsc --noEmit` exit 0, `biome check --error-on-warnings` on 136 files exit 0, 68 suites /
245 tests green in 9.5s, 0 token bypasses in the target's SCSS (no raw hex, no `rgb()`, no raw
durations; the 10 `px` declarations are all layout tracks, sr-only clips or an outline offset),
0 hardcoded durations with `prefers-reduced-motion` verified at the token layer
(`_tokens-motion.scss:11-17` zeroes all three duration tokens), 0 console errors — and the
remaining problems are all judgment problems.

**Visual overlays.** Injection succeeded (`document.title` sentinel set, `<script>` appended and
executed, `window.__impeccablePreflight === "mutation-ok"`). The live server ran on port 8401 and
was **stopped and verified stopped** (token endpoint → `stopping`; post-stop curl → connection
refused; pid 9434 gone). No overlay is currently visible in your browser — the server is down and
the tab was not left labelled, because this harness's browser toolset exposes no tab-labelling
call. Your own `npm run dev` on :3000 was left untouched.

---

## Overall Impression

The craft floor here is higher than most production work I see, and the ceiling is set by a
different problem entirely: **the page does not answer its own question.**

PRODUCT.md says the owner should open this, read one figure, and stop thinking about money. That
figure is `Gasto extra este mês — R$ 3.860,30`, and it was measured at **y = 1724px at 1280×720 —
2.39 viewports below the fold**, reached only after the hero band, the simulation select, three
KPI cards carrying 15 statistics, and two 264px charts. What is above the fold instead is
`R$ 141.227,10 — SALDO PROJETADO · Dez/28`, a 29-month-out projection wearing a green ▲ pill,
sitting beside the actual balance of R$ 7.720,60 rendered small and at 70% opacity.

Every individual card states its conclusion before its evidence. The **page** states its evidence
before its conclusion. That single inversion is the biggest opportunity on the screen, and fixing
the worst of it is a one-line reorder in an 18-line file.

---

## What's Working

**1. Contrast discipline that is measured, not asserted — and it holds under audit.** 190 text
nodes measured per theme with the full `opacity` chain and `color-mix()`/`color(srgb …)`
backgrounds resolved: **0 WCAG AA failures in light, 0 in dark.** The two tightest pairs in the app
are the cents fragment at 0.70 opacity over a semantic tone — 3.18:1 light, 4.33:1 dark, both
clearing the 3:1 large-text bar at 22px, and neither would clear 4.5:1 at body size, which is
exactly why `MoneyFigure` reserves it for large figures. This works because the reasoning is
committed beside the code: `_band.scss` explains why ink on themed fills must be `--color-bg`
rather than fixed white (fixed dark ink measured 3.12–3.31:1 in light); `_tokens-color.scss`
records three semantic foregrounds darkened one step because `#0e8c57` measured 3.88:1. This is
the rarest thing in the review and it is why the surface feels trustworthy up close.

**2. The confidence of a claim survives greyscale — four independent channels.** PRODUCT.md
demands projected / real / simulated never read as the same kind of fact, and this principle is
executed completely. A projected bar gets a **dashed 1.5px contour** (`BAR_STROKE`), not merely a
paler fill, and `chart-marks.config.ts` states why the fill alone was insufficient (~1.13:1). The
line chart splits into separate solid and dashed `LinePath`s sharing a seam point. A `PROJETADO`
tag names the region. `estimatedWord()` puts "previsto"/"lançado" into the tooltip *and* the
accessible title. Colour carries none of it.

**3. The responsive ceiling table is better than most production work.** It uses a **container
query, not a media query** — and the comment names the reason: this card is narrowest exactly when
the viewport is widest, so a viewport breakpoint would collapse the table at the one width where
it fits. Verified at 375px: container 293px, `tr → block`, `td → flex`, `<thead>` clipped with
`clip-path: inset(50%)` rather than `display: none` so table roles survive, and every cell prints
its own header via `td::before { content: attr(data-label) }` (computed content confirmed as
`"Saldo acum."`). Each stacked figure is self-describing.

**4. The tooltip is a textbook WCAG 1.4.13 implementation, and the box model hides it.** The
visible icon is 14×14px — `getBoundingClientRect()` reports 7 sub-44px targets and every one is a
false positive: `getComputedStyle(btn, '::after')` measures **44×44, position absolute**, and
`elementFromPoint` returns the trigger at ±21px on every axis. The same pseudo-element
deliberately bridges the gap to the bubble so a pointer travelling icon→bubble never crosses dead
space — which matters precisely because `--duration-fast` collapses to 0ms under reduced motion,
leaving no transition tail. Esc dismisses, blur and pointer-enter re-arm, and the bubble is never
unmounted so `aria-describedby` always resolves.

---

## Priority Issues

### [P1] The screen buries the one answer it exists to give

**Why it matters.** This inverts the project's first design principle at the page level. The
product's entire positioning — "a ceiling derived from every future month, not a budget imposed on
this one" — is invisible until the third screen. And the figure the design shouts loudest is the
one most likely to produce misplaced confidence: the emotional message is "you have 141 thousand";
the truth is "you have 7.7 thousand and a plan."

**Fix.** In `src/app/_components/DashboardScreen/components/Board/index.tsx`, move `<CeilingCard>`
above `<Overview>` — one line in an 18-line file, and `Board`'s flex column carries the
`--space-6` gap for free. Then promote the ceiling figure into `HeroBand` as the headline and
demote `SALDO PROJETADO · Dez/28` to a `Facts` entry: `HeroBand/hook.ts`'s `figures.value` reads
`last.cumulative` today, and the ceiling's monthly figure is already on the payload at
`data.ceiling`. The band is `data`-driven and already renders a static half in every non-`ok`
state, so this is a swap, not a rebuild.

**Suggested command:** `/impeccable layout`

---

### [P1] Cobalt is not rationed, and it marks everything except an action

**What.** 67 cobalt-painted elements measured live, from ten distinct decisions beyond the four
DESIGN.md permits (primary action / focus ring / mark / current nav item), with **zero primary
actions on the page**:

| File | Element | Cobalt use |
|---|---|---|
| `HeroBand/_title.scss` | `.cursor` (12×32 block after "Dashboard") | decorative `--color-brand` |
| `StatCard/_chip.scss` | `.chipBrand` | 12% cobalt wash + `--color-brand-text` icon |
| `StatCard/hook.ts` | `TONE_COLOR.brand` sparkline | cobalt fill + stroke |
| `BalanceLineChart/index.tsx` | line, area wash, 36 `DotMark` strokes | `--color-brand` |
| `SavingsSection/_banner.scss` | `.banner` background | cobalt wash `--band-fill` |
| `SavingsSection/_banner.scss` | `.eyebrow` (h2) | `--color-brand-text` text |
| `SavingsSection/_figures.scss` | `.factLabel` ×2 | `--color-brand-text` text |
| `GoalRow/style.module.scss` | `.icon` ×3 | `--color-brand` |
| `GoalRow/_bar.scss` | `.fill` ×3 progress bars | `--color-brand` |

**Why it matters.** DESIGN.md's Rationed Cobalt Rule: "A second cobalt element on a screen means
one of them is wrong." There are ten. This is not pedantry — accent colour is the strongest
affordance signal an interface has, and here it is exhausted on decoration and data before any
action can claim it. Someone fluent in Linear or Stripe reads accent colour as "this is where I
click." On this screen it never is.

**Fix, in order of payoff.**
1. `BalanceLineChart` and `StatCard`'s Saldo sparkline are **data**, and DESIGN.md provisions seven
   category hues for exactly this, each specified as distinguishable "from the others *and* from
   cobalt." Repoint `TONE_COLOR.brand` and `chart-line.config.ts`'s `LINE_PROPS`/`areaWashProps`
   to `--cat-cyan` or `--cat-violet`. This alone removes ~40 of the 67.
2. Delete `.cursor` from `HeroBand/_title.scss` and its `<span>` in `index.tsx` — a
   blinking-caret motif with the blink already removed for WCAG 2.2.2 is a rectangle with no
   remaining job.
3. `GoalRow`'s `.icon` → `--color-text-muted`; `.fill` → a category hue.
4. Keep the cobalt wash in `SavingsSection/_banner.scss` as the page's one branded surface if you
   want it — but not alongside three cobalt eyebrows inside it.

**Suggested command:** `/impeccable colorize`

---

### [P1] The eyebrow has metastasised (48 instances), and the hero band sets it in the wrong face

**What — two coupled defects, both confirmed by independent computed-style measurement.**

*(a) Volume.* 48 uppercase tracked labels on one screen. DESIGN.md scopes the eyebrow to "the card
kicker, IDs, `YYYY-MM` dates, hex values, chart axis and tag labels." Shipped, it is also every KPI
sublabel (`VALOR TOTAL NO PERÍODO`, `REALIZADO`, `MÉDIA/MÊS`, `MEDIANA`, `DESVIO PADRÃO` — 15
across three cards), every goal strategy label (9), and **all four `<th>` in `MonthTable`**. That
last one is a named violation: the Shouting Rule says "Status badges, **table headers** and
checkbox labels are sentence case." `MonthTable/style.module.scss` knows — it carries a `FOR REVIEW`
comment conceding the conflict and resolving it *against* the rule, pending a PR decision that
never landed. On `main`, the rule is documentation of an intention the code contradicts.

*(b) Wrong face.* Every eyebrow in the signature surface is **Clash Display, not IBM Plex Mono**,
with no tracking and no `text-transform`:

```scss
/* HeroBand/_title.scss */
.eyebrow {
  font-family: var(--font-display);   /* should be var(--font-mono) */
  font-size: var(--text-2xs);
  /* no letter-spacing: var(--tracking-wide) */
}
```

Same in `HeroBand/components/Facts/style.module.scss` `.label` and `GoalRow/_metrics.scss` `.label`.
Computed live: `PAINEL`, `SALDO PROJETADO · Dez/28`, `ENTRADAS 36M`, `SAÍDAS 36M`,
`MESES NO VERMELHO` → `clashDisplay`, `11px`, `letter-spacing: normal`, `text-transform: none`.
Every other card → `IBM Plex Mono`, `11px`, `letter-spacing: 1.54px`, `uppercase`. Twelve elements
in the wrong face.

**Why it matters.** DESIGN.md §6: "Don't put mono on body copy, uppercase on a status badge, or
**the display face on a label**." The Three Faces Rule: "A face outside its job is a bug, not a
variation." And it is visible, not theoretical — Clash Display 600 at 11px with `-0.02em`
inherited tracking and no compensating letter-spacing is why `ENTRADAS 36M` and
`MESES NO VERMELHO` render visibly cramped and run-together at both 1280 and 375. The one surface
the reader looks at first is the one place the type system is broken.

**Fix.** (a) Swap `--font-display` → `--font-mono` and add `letter-spacing: var(--tracking-wide)`
in `HeroBand/_title.scss`, `Facts/style.module.scss` and `GoalRow/_metrics.scss`. Then move the
uppercase out of the copy strings — `HeroBand/index.tsx`'s `COPY.painel`/`COPY.saldoProjetado`,
`hero-band.helper.ts`'s `` `ENTRADAS ${months}M` `` and `SavingsSection/index.tsx`'s ten `COPY`
constants are hardcoded uppercase, which defeats `text-transform` and hands screen readers strings
some voices spell letter-by-letter. `SectionCard/style.module.scss` already documents the right
pattern and the reason. (b) Demote the 15 KPI quadrant labels and the 4 `<th>` to sentence-case
`--font-sans` at `--text-2xs` in `StatCard/_quadrant.scss` and `MonthTable/style.module.scss`, and
close the `FOR REVIEW` note either way — a rule that loses silently is worse than a rule amended.

**Suggested command:** `/impeccable typeset`

---

### [P2] A routine expense is red on the biggest figure on its card, and on 36 chart bars

**What.** `Overview/index.tsx:41` passes `tone="negative"` to the Saídas `StatCard`, reaching
`Headline/style.module.scss`'s `.negative { color: var(--color-negative) }` and painting the
period's total outflow — `R$ 230.692,60`, the card's largest element — in `#c92a36` (measured
5.43:1 light, 7.63:1 dark, so it passes contrast; it fails the *rule*). `Overview/index.tsx`'s
`BAR_LEGEND` then assigns `--color-negative` to the whole expense series: 36 red bars.

**Why it matters.** This is the system's first pillar violated on the most prominent element — and
the codebase *knows*. `StatCard/_chip.scss`, about the same card:

> `// NOT the negative pair, on purpose: the target tints the Saídas chip neutral, and the first pillar of the constitution is that a normal expense is not red.`

The rule was applied to a 28×28 icon chip and abandoned on the 24px money figure beside it and on
36 chart bars. Separately, income-vs-expense in a bar chart is a **category** distinction, not a
financial state; DESIGN.md provisions seven category hues for chart series and restricts semantic
tones to "financial state and nothing else." Using positive/negative here also means a healthy
month and an unhealthy one are painted from the same two colours, so the chart cannot escalate.

**Fix.** Drop `tone="negative"` from the Saídas `StatCard` in `Overview/index.tsx` —
`formatMoney`'s sign already carries the meaning, exactly as `StatCard/hook.ts` says of the
quadrant rows ("Neutral: formatMoney's minus sign already carries the meaning here"). Repoint
`BAR_LEGEND` to two category hues (`--cat-green` / `--cat-amber`) and match `MonthlyBarChart`'s
series fills. Keep `--color-negative` on the Saldo card, where it *is* variation below zero.

**Suggested command:** `/impeccable colorize`

---

### [P2] Changing the ceiling cap silently replaces ~40 figures for assistive tech, and the four options are unlabelled

**What — two halves of one interaction, verified end to end.** Selecting 75% moves
`Gasto extra este mês` from `R$ 3.860,30` to `R$ 5.790,45` and recomputes all 29 table rows
(Out/26 `R$ 6.624,16` → `R$ 2.875,45`). During the swap `aria-busy` toggles, opacity drops to 0.7,
`cursor: progress`. And **`document.querySelectorAll('[aria-live]')` returns an empty array** —
there is no live region anywhere on the screen. `DashboardScreen/index.tsx` documents the gap and
then leaves it:

> `// aria-busy and nothing else while a cap change is in flight: … the only thing missing is the word that the figures are being replaced.`

Second half: `CapSelector`'s `<legend>` — "Quanto do saldo é liberado" — is `clip-path: inset(50%)`,
correctly preserving the group's accessible name but leaving **sighted** users four bare tokens
(`25% | 50% | 75% | Meta`), percentages of a quantity nothing on screen names. The only explanation
is `HINTS.ceiling`, measured at **687 characters** in a hover bubble.

**Why it matters.** `aria-busy` is not announced as a status by most screen readers, and a figure
changing inside a non-live region is silent. A screen-reader user presses → on the segmented
control, ~40 numbers change, and nothing is said — while the sighted dimming is the *only* channel
reporting the change at all, i.e. meaning by visual-only, the mirror of the colour-only failure
this codebase polices everywhere else. DESIGN.md's Button spec already mandates "a polite live
region so the label swap is announced," so the pattern is in-house and simply not applied to the
screen's most consequential control.

**Fix.** Add a `role="status"` / `aria-live="polite"` element inside the `data?.status === "ok"`
branch of `DashboardScreen/index.tsx`, announcing the settled figure (`Teto atualizado:
R$ 5.790,45 por mês`), driven off `refreshing` falling to `false`. Make the legend visible —
`CapSelector` renders inside `SectionCard`'s `headerEnd`, so a short visible label ("Liberar do
saldo:") beside the pills is one line and removes the need to read 687 characters. Then split
`HINTS.ceiling`: the first sentence is a definition and belongs in the card body as prose; the cap
trade-off belongs on the CapSelector.

**Suggested command:** `/impeccable harden`

---

## Persona Red Flags

**Alex — power user, opens this 4× a day, wants one number in three seconds.**
He opens the dashboard to decide whether he can spend R$ 2.000 today. The largest figure is
`R$ 141.227,10`, dated Dez/28, wearing a green ▲ badge — 29 months out and useless for the
decision — while the number he needs is 2.39 viewports down. He scrolls past 15 statistics he never
reads (mediana and desvio padrão of monthly income, three times over) and two 264px charts to reach
`R$ 3.860,30`. He clicks 75% to see if it buys him room: every figure changes, some months drop by
more than half (Out/26 R$ 6.624 → R$ 2.875), and the only explanation is a 687-character hover
essay. Tomorrow the cap is back to 50%, because `useDashboardScreen` deliberately does not persist
it while the simulation view *is* persisted in its own hook. No anchor to the ceiling, no keyboard
shortcut, no saved lens. Four visits a day, and the 3-second read is a 15-second scroll every time.

**Sam — screen reader plus 200% zoom, low vision.**
Most of this is genuinely good for Sam, unusually so: every text pair he meets clears AA in both
themes (0 failures across 190 nodes per theme), all 19 focusable elements carry the two-layer ring,
the segmented control is real radios so → works, chart regions are focusable scroll containers with
accessible names, tooltips dismiss on Esc and re-arm on blur, and every tooltip trigger has a real
44×44 hit target despite a 14×14 icon. Then he changes the ceiling cap. Forty figures are replaced
and **he is told nothing** — no live region exists, `aria-busy` flickers unannounced, and the
dimming that informs every sighted user is invisible to him. He cannot tell whether the board
updated, is still loading, or failed. Second: each chart point's figures ride on an `aria-label`
applied to a bare `<circle>` with no `role` (`DotMark/index.tsx` replaced the previous `<title>`
with it) — accessible names on unroled SVG shapes are inconsistently exposed, so the 36 per-month
readings he used to get may simply not be in his tree. Third, milder: in the desktop ceiling table
the current month is flagged by a `--color-positive` green pill (`_cells.scss` `.current`) while the
*same* concept two elements away is an inverted ink badge (`_badges.scss` `.now`) — at 200% zoom
with reduced colour discrimination, one temporal marker rendered two ways in one card, one of them
in the "good news" colour, is exactly what he has to stop and decode.

**"Tuesday morning operator" — PRODUCT.md's single fluent owner, the only person who ever drives
this.** He does not need teaching and the UI is right not to teach him; PRODUCT.md explicitly
licenses density and assumes fluency. What breaks for him is the opposite: **the screen never
states a conclusion.** PRODUCT.md's first principle is "Every surface states its conclusion in
words first; the table or chart underneath is the justification, not the message." Each card
honours that. The page does not. Its only sentence is a subtitle describing the page — "Onde o
dinheiro da família está hoje e para onde ele vai". Nowhere does it say "dá para gastar R$ 3.860
este mês sem nenhum mês fechar negativo" or "o mês mais apertado é Ago/26" — both facts are
computed and on the payload (`ceiling.tightest` is already passed into `BalanceLineChart`), but
they render as a caution-coloured tag inside a chart and a percentage in a table header. He gets
~90 numbers, four competing headline figures, a sr-only legend, and nine goal forecasts with no
recommendation — and he does the arithmetic the product exists to do for him. He is the whole
audience, and the surface is optimised for a reader who wants to browse rather than one who wants
to decide.

---

## Minor Observations

- **Alarm is pre-spent, so nothing can escalate.** Today's data shows `MESES NO VERMELHO: 0`, and
  the caution channel is already carrying structural annotation in the healthy state — the
  `MÊS MAIS APERTADO` tag, the `Limitado por Ago/26` badge, the ceiling column and its share bar
  are all `--color-caution`. When a month genuinely breaks there is no unspent register left.
  PRODUCT.md's "alarm when earned" needs an unused colour to earn.
- **Nine simultaneous completion forecasts.** `SavingsSection` + `GoalRow` render 3 goals × 3
  strategies (`DEDICADO` / `EM PARALELO` / `UM DE CADA VEZ`), each with a month count and a date,
  with no recommended default and no indication which is active. Nine answers to one question.
- **Cognitive load: 5 of 8 checks fail or partially fail.** Single focus (four competing
  "answers"), chunking (each StatCard carries 5 figures; CeilingCard 7 groups), visual hierarchy
  (four money figures at 28/24/24/28px and weight 700 — nothing wins), working memory (three rules
  needed to read the ceiling table live only inside the 687-char tooltip), progressive disclosure
  (only `ShowAllToggle` does any, and it is exemplary — 8 of 29).
- **The dark-theme glow is a corner accent in the spec and a wash in practice.** `--glow-brand` is
  672×672px on a 1016×320px band — 66% of its width, 2.1× its height. DESIGN.md licenses "a single
  cobalt radial glow **off its top-right corner**", so this is not a banned gradient; over the dark
  theme's near-white band it nevertheless renders as a lavender-to-periwinkle wash across the right
  half, which is close to the "purple-blue gradients" PRODUCT.md rejects by name. Shrink it rather
  than remove it.
- **Square where the system says 6px.** Measured `border-radius: 0px` on `ChartLegend`'s 12×12
  `.swatch` and `MonthTable`'s 41×15 `.current` badge. The Radius-By-Surface Rule assigns 6px to
  "chip / badge / swatch / inner cell" and says "never square". `.now` and `.limit` in
  `_badges.scss` get `--radius-sm` correctly — so the same badge concept differs on radius *and*
  colour inside one card.
- **The segmented control does not match its own spec.** DESIGN.md: "a 12% cobalt wash mixed over
  the surface, Cobalt Deep text, **semibold**. Weight carries the state a second time."
  `CapSelector/style.module.scss` inverts to `--color-bg`/`--color-text` instead, and `font-weight`
  measures **400 on selected and unselected alike.** The band-context reasoning for the inversion
  is sound; the lost weight channel is not. Amend the doc or restore the weight.
- **`MonthTable/style.module.scss` carries an unresolved `FOR REVIEW` block** deferring the
  table-header/Shouting-Rule conflict to a PR. It shipped to `main`. An open question living in a
  comment will be read as licence next time.
- **`R$ 3.860,3029 meses restantes`.** `CeilingCard`'s `.chip` ("29 meses restantes") is visually a
  separate 12px-offset pill, but in the DOM it abuts `MoneyFigure`'s cents span with no
  punctuation, so the `<dd>` reads as two adjacent numbers. Needs a comma or an `aria-label`.
- **`MoneyFigure` is spent 6 times** (hero, 3 KPI, ceiling, savings). Its own doc: "Reserved for the
  few figures the reader is meant to land on first … spend it everywhere and it marks nothing." Six
  is the outer edge of "a few", and it is one reason no single figure wins the hierarchy.
- **Chart dot hit radius is 10px (20px diameter)** — under WCAG 2.2 SC 2.5.8's 24×24, though the
  dense-data exception is arguable. `DotMark` already documents enlarging past the 4px face; 12
  clears it.
- **The error `Notice` has no retry.** `useDashboardScreen` sets `error` and the screen renders a
  sentence; recovery is a manual reload. A retry button re-running the effect is a few lines and
  closes Nielsen #9.
- **The `aria-hidden` sparklines are pure decoration** — no axis, scale or label, restating the four
  figures above them. If the KPI cards survive at all, this is the first thing to cut.
- **`check-line-cap.sh` checked zero files.** It diffs `$BASE...HEAD` with `BASE=main` while on
  `main`, so its green is vacuous here. A direct `wc -l` over all 169 target files confirms the cap
  holds — max is **exactly 100** (`StatCard/index.tsx`, `StatCard/hook.ts`,
  `SavingsSection/style.module.scss`, `BalanceLineChart/index.tsx`) — so this is a gate-shape note,
  not a violation.
- **Worth keeping, explicitly:** `heldFor()` tagging held payloads by owner so a profile switch
  never leaves one person's figures under another's name; the `current` flag guarding out-of-order
  responses; `HeroBand/hook.ts`'s `points.at(-1)` and `?? points[0]` fallbacks; `offeredCaps()`
  omitting the Meta segment entirely rather than disabling it. Four pieces of real defensive design.
- **Not exercised, and worth its own pass:** the empty / `no_range` first-run state. The DB is
  populated, so nobody looked at what a fresh checkout sees.

---

## Questions to Consider

1. **If the ceiling is the product, why is it the fourth card?** PRODUCT.md says the owner should
   open this, read one figure, and stop thinking about money. That figure is 2.39 viewports down
   and the hero shows a Dec/2028 projection instead. Is the hero band carrying the answer, or
   carrying the biggest number you had?
2. **The screen has ten cobalt decisions and zero primary actions — so what is cobalt telling the
   reader?** If the dashboard genuinely has nothing to act on, cobalt should be nearly absent here
   and the rule is intact. If it *should* have an action — "registrar movimentação", "ajustar meta"
   — then the missing button is the real finding, and the ten decorative cobalts are what filled
   the vacuum.
3. **Three documented rules now lose to "the target": table headers are uppercase, the eyebrow is
   on every label, four surfaces invert.** Each has a comment explaining why the rule was
   overridden in that one spot. At what point do you amend DESIGN.md instead? A constitution that
   loses every local argument is a style guide the code has stopped reading, and `MonthTable`'s
   `FOR REVIEW` note is the honest admission of it.
4. **Your icon chip is neutral because "a normal expense is not red," and the money figure beside
   it is red.** Which one is the design, and what process let the rule win on a 28px chip and lose
   on the 24px number the reader actually looks at? Same question for 36 red bars: if red is
   pre-spent on ordinary outflows, what colour is left for a month that genuinely breaks?
