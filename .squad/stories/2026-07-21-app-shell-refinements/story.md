# App shell refinements: full-height sidebar, dark toggle, icons, typography

## Description
The app shell shipped, but the layout needs correcting and enriching. Today the
header spans the full width across the top and the aside sits below it. The owner
wants the **aside to span the full viewport height** on the left, with the
remaining space split into a **header** (top) and **main** (below). On top of the
restructure:

- Add a **dark-mode toggle** to the header (persistent, no flash on load).
- Add an **icon to each nav menu item** (via `lucide-react`).
- **No `border-radius`** on nav hover/active states (sharp corners, matching the
  DS "angular" pillar); the header buttons follow suit for consistency.
- Nav links use **padding only** — no margin/gap between them, so hover/active
  backgrounds are full-width and flush.
- **Use the expected fonts/typography**: the pixel display face (Press Start 2P,
  `--font-display`) is loaded but currently unused anywhere. Give it a home — a
  **wordmark at the top of the aside** and the **page `<h1>` titles** — while
  everything else stays JetBrains Mono (`--font-mono`), with sizes/weights/
  tracking read from tokens.

Decisions taken during refinement (owner-confirmed):
- Icons come from **`lucide-react`** (a new dependency), not hand-authored SVG or
  emoji — the owner wants a cohesive, scalable set.
- The display font appears in **both** a sidebar wordmark **and** the page `<h1>`s.
  Wordmark text is **"CF"** as a placeholder — easily renamed in review.
- Dark toggle is **two-state (light/dark), persisted to localStorage**,
  initialized from `prefers-color-scheme` when unset, with a **pre-paint inline
  script** in the root layout to avoid a theme flash.

## Acceptance Criteria
- [ ] The aside spans the full viewport height as the left column; the header
      occupies the top of the right column and `<main>` the rest.
- [ ] The header contains three controls: the sidebar toggle (menu icon) and the
      greeting on the left, and the dark-mode toggle (sun/moon) on the right.
- [ ] The dark toggle flips light/dark, persists across reloads (localStorage),
      and there is **no theme flash** on load; its icon and `aria-label` reflect
      the current state.
- [ ] Each nav item shows a lucide icon left of its label; the icon color follows
      the link across hover/active/theme (via `currentColor`).
- [ ] Nav link hover and active states have **no border-radius**; their
      backgrounds are full-width/flush; links are separated by padding only (no
      margin, no list `gap`).
- [ ] Press Start 2P (`--font-display`) renders the aside wordmark and the page
      `<h1>` titles; all other text uses JetBrains Mono; sizes/weights/tracking
      come from tokens.
- [ ] All styling uses tokens — no hardcoded color/spacing/radius/shadow/duration.
      Icon pixel sizes (via lucide's `size` prop) are the one documented exception
      (the DS has no size-scale token yet).
- [ ] `lucide-react` is added to `dependencies`.

## Definition of Done
- [ ] Story + task files saved (this command).
- [ ] `npm run lint` is green.
- [ ] `npm run test` is green.
- [ ] `npm run build` succeeds.
- [ ] Verified in the browser (both themes): full-height sidebar; header's three
      controls; dark toggle persists across reload with no flash; nav icons
      present and color-following; sharp, flush, padding-only hover/active
      surfaces; display font in the wordmark and the page `<h1>`.

## Tasks
- [x] tasks/01-restructure-and-typography.md — Flip the grid (full-height aside;
      header+main in the right column), remove hover/active radius, make nav links
      padding-only/flush, and wire the display font into the aside wordmark and
      the page `<h1>`s.
- [x] tasks/02-dark-mode-toggle.md — Install `lucide-react`; add a persistent,
      no-flash dark-mode toggle to the header (sun/moon), and swap the hamburger
      glyph for a lucide `Menu` icon.
- [x] tasks/03-nav-icons.md — Give each nav item a lucide icon left of its label,
      colored via `currentColor`.
