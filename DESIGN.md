---
name: Controle Financeiro
description: The Forecast Desk — a cold-paper projection surface where one cobalt signal marks the only thing you can act on.
colors:
  signal-cobalt: "#2550cc"
  cobalt-deep: "#1e40a6"
  cobalt-press: "#1b3585"
  cobalt-mist: "#bbcbfa"
  cold-paper: "#f8f9fb"
  surface-sheet: "#ffffff"
  surface-sunken: "#f2f4f6"
  ink: "#14171c"
  ink-secondary: "#333a45"
  ink-muted: "#4c5460"
  hairline: "#e2e5ea"
  hairline-subtle: "#ebeef1"
  hairline-strong: "#c4c9d1"
  positive: "#0a7548"
  negative: "#c92a36"
  caution: "#9c4a0c"
  info: "#0c6b9b"
  category-violet: "#7b5bc4"
  category-lime: "#5e8c36"
  category-magenta: "#9c57a0"
  category-green: "#2e7d6b"
  category-red: "#b14a5c"
  category-amber: "#a56a2e"
  category-cyan: "#2c84a8"
typography:
  display:
    fontFamily: "Clash Display, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Clash Display, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Clash Display, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0"
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0"
  money:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.3
    fontFeature: "tabular-nums"
  hero-figure:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.08
    fontFeature: "tabular-nums"
  eyebrow:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0.14em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  full: "9999px"
spacing:
  space-1: "4px"
  space-2: "8px"
  space-3: "12px"
  space-4: "16px"
  space-5: "20px"
  space-6: "24px"
  space-8: "32px"
  space-10: "40px"
  space-12: "48px"
  space-16: "64px"
  space-20: "80px"
  space-24: "96px"
  tap: "44px"
components:
  button-primary:
    backgroundColor: "{colors.signal-cobalt}"
    textColor: "{colors.cold-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-deep}"
  button-primary-active:
    backgroundColor: "{colors.cobalt-press}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  button-dashed:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
    width: "100%"
  button-danger:
    backgroundColor: "{colors.negative}"
    textColor: "{colors.cold-paper}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "44px"
  input-text:
    backgroundColor: "{colors.surface-sheet}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "44px"
  section-card:
    backgroundColor: "{colors.surface-sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "12px"
    height: "44px"
  nav-item-current:
    backgroundColor: "#eef1fd"
    textColor: "{colors.cobalt-deep}"
  modal-panel:
    backgroundColor: "{colors.surface-sunken}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
    width: "480px"
  hero-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cold-paper}"
    typography: "{typography.hero-figure}"
    padding: "48px 40px"
---

# Design System: Controle Financeiro

## 1. Overview

**Creative North Star: "The Forecast Desk"**

A cool, well-lit desk where next month is read off today's figures. The surfaces
are cold paper — a neutral ramp with blue in it, never warmth — and they carry
roughly ninety percent of the interface. One instrument sits on that desk:
Signal Cobalt, spent only where the app is actually signalling. The primary
action, the focus ring, the mark, the current rail item. Nothing else is blue,
which is what makes blue mean something.

The system is confident and opinionated without raising its voice. Screens state
the conclusion first — the ceiling, the projected balance, whether the pace holds
— and put the table or the chart underneath as justification. Colour never
decorates: the four semantic tones speak financial state and nothing else, so a
normal expense is not red. Red is negative variation and destructive action, and
it stays that way even when a screen is full of expenses.

Everything is **contained, not extruded**. A hairline and a surface tier lift a
thing before a shadow does; corners are soft and chosen by what the surface *is*,
never by taste. This rejects, by name, the Brazilian bank-app house style
(brand-colour floods, promo cards, banners, cross-sell), the generic SaaS
dashboard (gradient hero metric, four identical icon-and-number KPI cards), the
spreadsheet-in-a-browser (grids with no hierarchy), and gamified finance
(mascots, confetti, streaks, emoji categories).

**Key Characteristics:**
- Cold-paper neutrals carry ~90% of every screen; cobalt is rationed.
- Border-first elevation — a shadow only when a layer genuinely floats.
- Three faces, one job each: display for titles, grotesque for body and money, mono for eyebrows and dates.
- Soft corners by surface type (6 / 10 / 14 / 20), never square, never a capsule on a rectangle.
- Both themes are first-class; the dark theme is derived by inverting the ramp, not by dimming the light one.
- Every text pair carries its measured contrast ratio in a comment beside the token.

## 2. Colors

Cold paper with blue in it, one cobalt signal, and four semantic tones that are
allowed to speak only about money.

### Primary
- **Signal Cobalt** (`{colors.signal-cobalt}`): the fill and the mark. Primary buttons, the focus ring, the hero band's top rule, the active-state wash on rail items (mixed at 12% over the surface, never solid). It is the only brand hue in the system.
- **Cobalt Deep** (`{colors.cobalt-deep}`): cobalt as *copy*. Any cobalt text — the modal eyebrow, the current rail label, a brand-tinted link — takes this step, because the fill tone measures under 4.5:1 as text on a raised surface. Also the primary button's hover fill.
- **Cobalt Press** (`{colors.cobalt-press}`): the primary button's active fill. In the dark theme, hover and active *lighten* instead — darkening a fill on a dark surface reads as disabled.
- **Cobalt Mist** (`{colors.cobalt-mist}`): a light accent that stays light in both themes, because its one consumer paints ink on top of it.

### Neutral
- **Cold Paper** (`{colors.cold-paper}`): the page. Off-white with a blue cast, never cream, never sand.
- **Sheet** (`{colors.surface-sheet}`): the card and field surface — pure white on cold paper.
- **Sunken** (`{colors.surface-sunken}`): the raised/inset tier — modal panels, inner panes, disabled fills.
- **Ink** (`{colors.ink}`): primary text, and the fill of the inverted hero band.
- **Ink Secondary** (`{colors.ink-secondary}`): supporting copy.
- **Ink Muted** (`{colors.ink-muted}`): the muted tier. Deliberately one step darker than the ramp's mid-grey, which measured 4.48:1 and failed the floor by a hair.
- **Hairline / Hairline Subtle / Hairline Strong** (`{colors.hairline}`, `{colors.hairline-subtle}`, `{colors.hairline-strong}`): separation, in that order of assertiveness. These do structural work that shadows do in other systems.

### Secondary (semantic state)
- **Positive** (`{colors.positive}`): upward variation, gains, on-pace savings.
- **Negative** (`{colors.negative}`): downward variation and destructive action. Not "expense".
- **Caution** (`{colors.caution}`): a month that is tight but not broken; the caution chart tag.
- **Info** (`{colors.info}`): neutral annotation on data.

### Tertiary (category hues)
Seven owner/category hues (`{colors.category-violet}` through `{colors.category-cyan}`), each distinguishable from the others *and* from cobalt. They identify people and categories in charts and swatches. They are data, not decoration, and never leak into chrome.

### Named Rules

**The Rationed Cobalt Rule.** Cobalt appears on the primary action, the focus ring, the mark, and the current navigation item — nowhere else. A second cobalt element on a screen means one of them is wrong.

**The Themed Ink Rule.** When a *themed* fill is a background, the text on it is `{colors.cold-paper}` — the page colour — and nothing else. That covers all four semantic tones (5.15–9.37:1 either way) **and cobalt**, which is `--cobalt-600` in light and `--cobalt-400` in dark and so is themed like the rest: page-colour ink on it measures 6.43 / 8.52 / 10.52:1 light and 5.31 / 8.59 / 11.99:1 dark for rest / hover / active. Fixed white belongs only on a fill that is genuinely dark in both themes — the seven category hues and the mark.

**The Expense-Is-Not-Red Rule.** Semantics speak financial *state*. A routine expense is body text with a minus sign, not a red figure. Reserve red for variation below zero and for destructive controls.

## 3. Typography

**Display Font:** Clash Display 600 (self-hosted `.woff2`)
**Body Font:** Hanken Grotesk (via `next/font`)
**Label/Mono Font:** IBM Plex Mono (400/500/600)

**Character:** A tight, modern display face over a neutral grotesque — contrast on the geometric-versus-humanist axis, not two sans faces pretending to differ. The mono is a third voice with a strictly technical job, so the pairing never reads as decorative. Nothing fetches a face at runtime; all three load through `next/font`.

### Hierarchy
- **Display** (Clash Display 600, 3.5rem/56px, 1.08, -0.02em): the top step of the scale, held in reserve. Nothing spends it today, and a new screen should need a reason to be the first.
- **Headline** (Clash Display 600, 1.75rem/28px, 1.08, -0.02em): page-level titles.
- **Title** (Clash Display 600, 1.125rem/18px, 1.3): card and modal titles — what the base `h1` actually renders.
- **Body** (400, 0.9375rem/15px, 1.55): prose and explanations, capped at 65–75ch.
- **Label** (500, 0.875rem/14px, 1.3): field labels, buttons, table headers, nav items. Sentence case.
- **Money** (600, tabular figures): every currency figure, in the body face — never the display face.
- **Hero figure** (700, 1.75rem/28px, tabular figures): the answer on the inverted band. Grotesque, not display: it is money, and money keeps the body face. Cents dim to 70% opacity — measured, not the 45% that would drop them under the text floor. It breaks rather than widening the page at 375px.
- **Eyebrow** (mono, 0.6875rem/11px, +0.14em, uppercase): the card kicker, IDs, `YYYY-MM` dates, hex values, chart axis and tag labels.

### Named Rules

**The Three Faces Rule.** Display for heroes and titles. Grotesque for body, labels and every money figure. Mono for eyebrows, IDs, `YYYY-MM`, hex and chart labels. A face outside its job is a bug, not a variation.

**The Shouting Rule.** `text-transform: uppercase` and wide tracking belong to the mono eyebrow and nowhere else. Status badges, table headers and checkbox labels are sentence case; wide tracking on a grotesque reads as shouting.

**The Tabular Rule.** Money always sets `font-variant-numeric: tabular-nums`. Columns of figures must align on the decimal without the reader's eye doing the work.

## 4. Elevation

Elevation is **border-first**. A surface tier plus a hairline is the default way to lift something, and most of the interface never leaves that tier: cards, fields, rail items and rows are flat surfaces with a 1px frame. A shadow appears only when a layer genuinely floats over content — and there are exactly three of those, cool and discreet, never decorative. The hard offset shadows of the app's previous skin are gone from the tokens and from the mixin, so asking for one is a build error rather than a silent alias.

### Shadow Vocabulary
- **Raised** (`box-shadow: 0 1px 2px rgb(20 23 28 / 5%), 0 1px 1px rgb(20 23 28 / 3%)`): a resting card that has to separate from a busy background. Most cards do not need it.
- **Overlay** (`box-shadow: 0 6px 16px rgb(20 23 28 / 8%), 0 2px 4px rgb(20 23 28 / 4%)`): dropdowns, popovers, sheets.
- **Modal** (`box-shadow: 0 16px 40px rgb(20 23 28 / 12%), 0 4px 8px rgb(20 23 28 / 5%)`): the one layer that floats over the whole page.

In the dark theme the geometry is identical and the alpha rises sharply (40% / 56% / 64%, cast in black rather than ink) — at light-theme alphas a shadow vanishes entirely against a dark surface.

### Named Rules

**The Hairline-First Rule.** If a hairline and a surface tier can carry the separation, they must. Reach for a shadow only when the layer physically floats over something.

**The Press-Is-Scale Rule.** A control's press is `transform: scale(0.985)`. Never a displacement, never a shadow that shortens — there is no extrusion behind it to shorten.

## 5. Components

Contained and unfussy: hairline frames, soft corners, nothing extruded. A control reads as a boundary drawn around a job, not an object sitting on the page.

### Buttons
- **Shape:** soft 10px corners (`{rounded.md}`), minimum 44px tall, 8px/16px padding.
- **Primary:** Signal Cobalt fill, page-colour label, **no border** — a frame on top of a solid fill is a leftover from an extruded skin. Hover darkens to Cobalt Deep, active to Cobalt Press (both *lighten* in the dark theme, which is exactly why the ink has to flip with them).
- **Ghost:** transparent with a subtle hairline; hover fills with the neutral wash. The default for secondary actions.
- **Danger / Success:** the semantic fill with page-colour ink on top. Hover mixes 88% of the fill toward the text colour, so it darkens in light and lightens in dark.
- **Dashed:** a full-width dashed 2px outline — the "Adicionar …" affordance at the foot of every list card. On hover it fills cobalt and the border goes solid.
- **Focus:** the two-layer ring on every variant. **Disabled:** a muted fill *and* a muted border, not just reduced opacity.
- **Loading:** takes the disabled treatment and adds what separates working from unavailable — a turning `currentcolor` ring in the gap after the label, `cursor: progress`, and `aria-busy`. The ring holds still under `prefers-reduced-motion` rather than trading one animation for another.
- **Hover** is scoped to `@media (hover: hover)`, so a tap never leaves a touch device holding a hover state.

### Cards / Containers
- **Corner Style:** 14px (`{rounded.lg}`). An inner corner flush inside it is derived — `calc(var(--radius-lg) - var(--border-1))` — never a second literal.
- **Background:** Sheet on Cold Paper; the sunken tier for inner panes.
- **Shadow Strategy:** flat by default. See Elevation.
- **Border:** a single hairline. **Internal Padding:** 24px, with a 16px stack gap.
- **Anatomy:** a mono eyebrow title, an optional trailing slot pushed right, then the body. Cards are never nested inside cards.

### Inputs / Fields
- **Style:** Sheet background, hairline border, 10px corners, 44px minimum height, label above the control at 13px.
- **Focus:** the ring is applied on `:focus-within` at the field level, so the label and control light up as one object.
- **Error:** the message sits under the field in Negative with an icon beside it — never colour alone.

### Navigation
- A left rail on `md` and up, an overlay drawer below it; the shell is a two-area grid where the rail spans both rows. Items are 44px tall, 10px corners, body face at 14px.
- **Current:** `aria-current="page"` is the styling hook, so the accessibility signal and the paint can never drift. It renders as a 12% cobalt wash mixed over the surface plus Cobalt Deep text at semibold weight — never a solid brand fill, which would compete with the one real action on the page.
- **Collapsed:** labels are hidden, not unmounted, so the DOM stays stable across the width transition.

### Modal
- A native `<dialog>`: sunken panel, 14px corners, 480px cap, sticky header on the panel's own surface, footer actions right-aligned. The backdrop is one flat ink at 55% and does **not** flip with the theme — a light scrim brightens the page it is meant to push back.

### Hero Band (signature)
The one surface on the dashboard that inverts: near-black in light, near-white in dark, full-bleed to the content column. A 4px cobalt rule runs across its top and a single cobalt radial glow sits off its top-right corner — the only gradient the system permits, and it works in both themes because the band flips underneath it. It carries the display figure that answers the screen's question. Never more than one per page.

### Money Figure (signature)
Whole number at full strength, cents at 70% opacity, as a fragment rather than a wrapper so a screen reader still announces one uninterrupted figure and a copy/paste yields one number. Reserved for the few figures the reader is meant to land on first — spend it everywhere and it marks nothing.

### Named Rules

**The Radius-By-Surface Rule.** 14px for card / section / modal / tile, 10px for button / field / select / nav item / menu, 6px for chip / badge / swatch / inner cell, 20px for large sheets, full only for avatars, status dots and progress tracks. Never by taste, never square.

**The Motion-Is-State Rule.** 140ms for feedback, 220ms for transitions, 320ms at the outside, on an ease-out curve with no bounce. Motion reports a state change and nothing else; durations collapse to `0ms` under `prefers-reduced-motion` at the token layer.

## 6. Do's and Don'ts

### Do:
- **Do** read every value from a token: `var(--color-surface)`, `var(--space-4)`, `var(--radius-lg)`. Hardcoding a colour, space, radius, shadow or duration is prohibited; the single documented exception is `src/app/icon.svg`, which cannot read a custom property.
- **Do** state the conclusion before the evidence — the sentence, then the chart.
- **Do** pair meaning with a second signal. Money carries colour *and* a sign *and* a ▲/▼ glyph; real / estimated / simulated pair a label with a border style; the current nav item carries weight as well as tint.
- **Do** give every interactive element the two-layer focus ring, including the transparent outline — that outline is the forced-colors escape hatch and dropping it makes the ring vanish in Windows High Contrast.
- **Do** write the measured contrast ratio in a comment beside any new colour token, in both themes.
- **Do** add every new semantic token to the light block *and* the dark mixin. A token that exists in one theme only is a bug.
- **Do** keep hit targets at 44px or larger.

### Don't:
- **Don't** build anything that reads like a **Brazilian bank app**: brand-colour floods, rounded promo cards, banners, cross-sell, marketing voice inside a tool.
- **Don't** build the **generic SaaS dashboard**: the gradient hero metric, four identical icon-and-number KPI cards, purple-blue gradients, a chart that exists because dashboards have charts.
- **Don't** ship a **spreadsheet in a browser**: a raw grid of hairlines with no hierarchy, data dumped instead of answered.
- **Don't** gamify: no mascots, confetti, streaks, emoji categories or congratulatory toasts. Money is not a game.
- **Don't** use decorative gradients, glassmorphism or texture. The background is flat; the cobalt hero glow is the only gradient in the system and it belongs to the hero band, never to the mark.
- **Don't** colour a routine expense red.
- **Don't** put a capsule radius on a rectangle. Full radius is for avatars, status dots, progress tracks and segmented pills only.
- **Don't** put mono on body copy, uppercase on a status badge, or the display face on a label, a button or a data figure.
- **Don't** reach for a shadow where a hairline works, and don't reach for a modal where an inline or progressive alternative works.
- **Don't** invent an alias token that adds no decision over the token it points at — that is a second name for a colour, not a token.
