# design-sync notes

Project: **Controle Financeiro DS** — https://claude.ai/design/p/ce617a30-be96-46bf-924a-45e9fc6f957e
Scope: **foundations only** (tokens + constitution). No components, no stories.

## Why this is an off-script (hand-authored) sync

This repo is a Next.js app, **not** a component library: no bundlable `dist/`
exposing `window.<Global>` components, and Storybook holds only Foundations MDX
docs (`src/styles/docs/*.mdx`) — **zero `*.stories.*` files**. So the component
converter (`package-build.mjs`) and the screenshot-grading oracle have nothing
to operate on. Per the skill's ladder-last-rung ("the upload format is the
contract, not the converter"), the foundations layout is produced directly.

## How to rebuild (deterministic)

```sh
OUT=ds-bundle
rm -rf "$OUT" && mkdir -p "$OUT/tokens" "$OUT/fonts"
# 1. Compile the SCSS token layer → CSS custom properties (both themes)
npx sass --no-source-map --load-path=src/styles src/styles/_tokens.scss "$OUT/tokens/tokens.css"
npx sass --no-source-map --load-path=src/styles src/styles/_base.scss   "$OUT/tokens/base.css"
# 2. styles.css and fonts/ are authored/fetched once — reuse the committed
#    ds-bundle copies if present, else re-fetch the two Google fonts (latin woff2:
#    Press Start 2P 400, JetBrains Mono variable) and re-author styles.css.
#    styles.css MUST @import tokens BEFORE @font-face/:root (CSS @import ordering).
# 3. Generate the Foundation cards from the compiled tokens
node .design-sync/gen-cards.mjs "$OUT"
# 4. Author README.md = conventions.md + a short index (see prior README).
```

Then upload every file under `ds-bundle/` (sentinel `_ds_needs_recompile`
first and last). No `_ds_sync.json` anchor is emitted.

## Re-sync risks / watch-list

- **Fonts are self-hosted, latin-only.** Fetched from Google Fonts at sync time
  (`fonts/*.woff2`). JetBrains Mono is a single **variable** file (weight range
  100–800). If the app adds non-latin glyphs, the subset won't cover them.
- **`--font-display` / `--font-mono` are re-declared in `styles.css`**, because
  in the app they come from `next/font/google` (not present in the bundle). If
  the app swaps typefaces, update `styles.css` `@font-face` + `:root`, and the
  fonts in `fonts/`.
- **`@import` ordering in `styles.css`** — the token `@import`s MUST precede the
  `@font-face`/`:root` rules or the browser silently drops them (tokens vanish,
  swatches render empty). This bit once; keep imports at the very top.
- **No anchor** → every re-sync re-verifies from scratch (fine at this size).
- **Cards read light-theme token values** via first-wins parsing of the
  compiled CSS (`gen-cards.mjs`). If `_tokens.scss` is reordered so a dark
  override precedes its light declaration, the parser would pick the dark value.
- Token source of truth stays `src/styles/_tokens.scss` + `_theme.scss` +
  `src/styles/README.md` (the constitution). `.design-sync/conventions.md`
  mirrors the vocabulary for the design agent — re-validate its token names
  against `tokens/tokens.css` on any re-sync.
