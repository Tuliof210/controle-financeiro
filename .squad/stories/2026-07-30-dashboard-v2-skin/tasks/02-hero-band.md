# The full-bleed hero band absorbs PageHeader

## Outcome
- `/` opens on one dark band that runs edge to edge of the content column, sits
  directly under the app header with no gap, and carries on its left the PAINEL
  eyebrow, the `Dashboard` title and the subtitle, on its right SALDO PROJETADO ·
  <mês>, the figure, the delta chip and "vs. saldo atual de …", and below a rule
  the three existing facts.
- The title half renders in every state — loading, error, `no_range`,
  `out_of_range`, `ok`. The figures and facts render only when the payload is ok.
- `/` no longer renders `PageHeader`. `/previsoes`, `/movimentacoes`,
  `/leitor-ofx`, `/ofx-decoder` and `/configuracoes` still do, unchanged.

## Context
Design: `design.html` lines **156-199** (band 156-158, two-column head 159-180,
facts strip 182-198). Nothing on the band is new data — `useHeroCard` already
returns `endLabel, value, now, delta, deltaUp, facts`, and `facts` is already the
three the design draws, including `MESES NO VERMELHO`.

**Keep the theme inversion.** `HeroCard/style.module.scss` opens with
`background: var(--color-text); color: var(--color-bg);` under the comment *"the
only surface on the dashboard that flips, which is what makes it read as the
headline rather than a fourth card."* The design pins raw `--ink-900`/`--paper`
instead; the owner chose the inversion. It also means the four measured
`opacity: 0.7` sites in that file (`.eyebrow` carries *"8.69:1 light / 6.71:1
dark against the hero fill — measured, not assumed"*) stay valid — do not
repaint the fill.

**The bleed.** `AppShell`'s `<main>` pads all sides `--space-4`, and
`--space-10` from `t.bp("md")` up; `.page` inside it is `max-width: 1560px;
margin: 0 auto`. `.screen` and `.board` add no padding and no `overflow`.
So the band escapes with negative inline margins mirroring exactly those two
paddings, written per breakpoint — nothing else. It bleeds to the **content
column** edge, not the viewport: above a ~1640px viewport `.page`'s centering
margin stays visible either side. That is accepted; do not chase it with `100vw`
math, which cannot know the rail's width.

**Where it renders.** `DashboardScreen/index.tsx` today is
`PageHeader → notices → <div aria-busy> → <Board>`, and the hero is two levels
down (`Board → Overview → HeroCard`). Move it up to be the screen's first child,
above the notices, and drop it from `Overview/index.tsx`. Rename the folder to
`HeroBand` while you are there — it has no importer outside this tree, and
"Card" stops being true. `PageHeader`'s copy moves with it verbatim: eyebrow
`PAINEL`, title `Dashboard`, subtitle `Onde o dinheiro da família está hoje e
para onde ele vai.`

**The 100-line cap.** `HeroCard/style.module.scss` is already **158 lines** and
this task grows it. Split it the way this tree already splits: a `_*.scss`
holding one `@mixin`, `@use "./name" as *;` at the top of `style.module.scss`
and `@include name;` at the point in cascade order the rules belong — see
`CeilingCard/_badges.scss` + its parent's line 1 and line 12. A partial that
needs `t.bp` must `@use "theme" as t;` in its own file, `@use` is not transitive.
Lifting a rule out of a nesting **strips it**: re-nest under the same ancestor or
it silently loses specificity. And Turbopack never sees a partial created while
the dev server runs — `touch` it.

**The title.** It becomes the band's `<h1>`; `_base.scss` styles `h1` globally,
so the band's own rules have to say what they want. Do **not** put an `<h3>`
anywhere in this band: `e2e/goals.spec.ts` finds goal cards as *"the only
`<section>` on this page carrying an `<h3>`"*, and one here silently breaks five
tests. `<h2>` is free.

**The cursor block after the title** (design line 167) is a lime rectangle.
Render it static. The design blinks it on a 1.1s infinite loop; anything blinking
for more than five seconds has to be stoppable (WCAG 2.2.2), and
`prefers-reduced-motion` does not discharge that. The top rule (design line 158)
becomes the band's full-width `--gradient-toxic` edge, replacing today's 64x4
`.rule`.

## Scope
- In: `src/app/_components/DashboardScreen/index.tsx` + `style.module.scss`,
  the `HeroCard` folder (renamed to `HeroBand`, plus its new partial),
  `components/Overview/index.tsx`.
- Out: `src/components/PageHeader/**` and `src/components/AppShell/**` — both
  stay exactly as they are; the band escapes the shell, it does not change it.
  Also out: `useHeroCard`'s figures, the notices' copy, `Board/`.

## Verify
- `npm run lint`; `wc -l` every touched file including both `.scss`.
- `npm run build`; `npm test` — stop any `npm run dev` first, Next 16 locks per
  directory so a server on :3000 blocks Playwright's own on :3100.
- Browser preview at 375, 767, 768, 1024, 1440, both themes: the band touches the
  left and right edges of the content column at every width, has no gap under the
  app header, and the facts strip goes one column below `md` and three above it.
- Confirm `document.documentElement.scrollWidth <= clientWidth` at all five.
- Load `/` with an empty database (or force `status: "no_range"`) and confirm the
  title half still renders with the notice below it.
- Open the five other routes and confirm `PageHeader` is untouched.

## Forbidden
- No blinking, flashing or auto-looping animation.
- No `overflow: hidden` on any ancestor of a focusable element; the band's own
  `overflow: hidden` (it clips the scanline) must stay free of focusable content.
- No raw colour and no raw pixel margin — the bleed is the two padding tokens,
  negated.
- Do not change what `useHeroCard` computes, or any fact's label or wording.
