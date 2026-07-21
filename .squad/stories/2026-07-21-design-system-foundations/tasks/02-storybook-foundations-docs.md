# Storybook + Foundations MDX docs

## Description
Install and configure Storybook to render the Task 01 tokens as living
**Foundations** documentation, with a working light/dark toggle. **No
component stories** — this Storybook exists purely to document the design
system's foundations as MDX pages. This makes the DS rules visible and
reviewable, and gives future component work a ready home.

Investigation notes that drive this task (already verified — do not
re-research):
- **Latest Storybook is `10.5.3`** (not 9.x). `@storybook/nextjs-vite@10.5.3`
  officially supports Next 16 + React 19.2 (`next` peer range includes
  `^16.0.0`; bundles `vite-plugin-storybook-nextjs ^3.3.0`).
- **Do NOT run `npx storybook init`** — it scaffolds example `*.stories.tsx`
  component stories, which this story forbids. Add deps + config by hand.
- **`vite` is a peer dep and is NOT in the lockfile** — add it explicitly
  (`vite@^8`), or install fails.
- **Pin every `@storybook/*` package and `storybook` core to the same exact
  version (`10.5.3`)** — version mismatch is the #1 Storybook breakage.
- Sass (already installed) and `next/font/google` work out of the box in
  `@storybook/nextjs-vite`; no extra config beyond loading the global styles.
- Biome **lints `.storybook/*.ts`** (format + ≤100 lines/file + ≤100
  lines/function) but **ignores `.mdx`** (unknown file type) — so keep the
  config `.ts` tidy; MDX is free-form.

## When to run
- Depends on: Task 01 (needs the tokens, `data-theme` mechanism, fonts, and
  `src/styles/globals.scss` to document and load).
- Parallel-safe with: none.

## How-to

**Dependencies** — add as devDependencies, exact versions:
```
storybook@10.5.3
@storybook/nextjs-vite@10.5.3
@storybook/addon-docs@10.5.3      # MDX docs blocks (separate addon in SB10)
@storybook/addon-themes@10.5.3    # light/dark toggle
vite@^8                           # peer dep, not yet installed
```
Install via `npm i -D <pkgs>`; verify the lockfile resolves all `@storybook/*`
to `10.5.3`.

**Scripts** (`package.json`):
```json
"storybook": "storybook dev -p 6006",
"build-storybook": "storybook build"
```

**`.storybook/main.ts`** (keep ≤100 lines, formatted for Biome):
```ts
import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  framework: "@storybook/nextjs-vite",
  stories: ["../src/**/*.mdx"], // MDX docs only — no component stories
  addons: ["@storybook/addon-docs", "@storybook/addon-themes"],
};

export default config;
```
The `*.mdx`-only glob guarantees no `*.stories.tsx` is ever picked up, and
autodocs never triggers (no CSF stories exist).

**`.storybook/preview.ts`** (≤100 lines, formatted; Biome will want ordered
imports):
```ts
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import type { Preview } from "@storybook/nextjs-vite";
import "../src/styles/globals.scss"; // Task 01 global tokens + base

const preview: Preview = {
  decorators: [
    withThemeByDataAttribute({
      themes: { light: "light", dark: "dark" },
      defaultTheme: "light",
      attributeName: "data-theme",
    }),
  ],
  parameters: {
    backgrounds: { disable: true }, // theme tokens own the background
  },
};

export default preview;
```
`withThemeByDataAttribute` sets `<html data-theme="light|dark">`, which is
exactly how Task 01's tokens switch — the toolbar toggle then flips every
Foundations page between themes.

**Fonts in Storybook:** `next/font` is supported out of the box. If the
Foundations pages need the display/mono fonts applied to `<html>` (they do,
to show real specimens), either import the same font-variable setup used in
`layout.tsx` from a shared module and apply the classNames via a preview
decorator, **or** rely on the global `globals.scss` fallback fonts. Prefer
sharing the `next/font` loaders from a small `src/styles/fonts.ts` used by
both `layout.tsx` (Task 01) and `preview.ts` so specimens are truthful. If
Task 01 inlined the loaders in `layout.tsx`, extract them here into
`fonts.ts` and re-import in both.

**Sass loadPaths in Storybook:** verify `@use 'tokens'/'theme'` resolves.
`@storybook/nextjs-vite` inherits `sassOptions` from `next.config.ts` (Task 01
set `loadPaths: ["src/styles"]`). If a `@use` fails to resolve at
`storybook dev`, add a `viteFinal` in `main.ts` merging
`css.preprocessorOptions.scss.loadPaths = ["src/styles"]` (keep the file
≤100 lines — extract a helper if needed).

**Foundations MDX pages** (`src/styles/docs/*.mdx`, or colocated under
`src/styles/`). Each is a docs-only page — a `<Meta>` with a `title` and **no
`of` prop, no stories**:
```mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Foundations/Colors" />

# Colors
{/* swatch table markup reading the live CSS vars, e.g. a cell with
    style={{ background: "var(--color-brand)" }} so it stays truthful and
    theme-reactive */}
```
Author one page per category, rendering swatches/tables from the **live CSS
variables** (not copied hex) so docs never drift and react to the theme
toggle:
- `Foundations/Overview` — restate the constitution (the four pillars +
  non-negotiable rules from `src/styles/README.md`).
- `Foundations/Colors` — primitive ramp + semantic swatches (bg/surface/
  text/border/brand/accent/positive/negative/caution/info/focus) + the two
  gradients; show a money example (▲ +value green / ▼ −value red / caution).
- `Foundations/Typography` — display vs mono specimens, the size scale,
  weights, and a tabular-nums money sample.
- `Foundations/Spacing` — the 4px scale as visual bars.
- `Foundations/Radius & Borders` — radius steps (0/2/4/6) + border widths +
  the corner-tick accent example.
- `Foundations/Elevation` — flat/raised/overlay, stating the "no hard offset
  shadow" rule.
- `Foundations/Motion` — durations/easings, noting reduced-motion.

Keep all swatch/spec markup inline in MDX/JSX — **do not** create DS
components or `*.stories.tsx` to render them.

**Docs/CLAUDE.md:** add the `storybook` / `build-storybook` commands to
`CLAUDE.md`'s Commands section (and to `.squad/ARCHITECTURE.md` if it lists
tooling).

**Verification (all must be green):**
- `npm run lint` — Biome green; `.storybook/*.ts` formatted + ≤100 lines;
  `.mdx` is ignored by Biome (expected).
- `npm run storybook` — boots on :6006; every Foundations page renders; the
  toolbar **theme toggle flips light↔dark** and swatches/specimens react.
- `npm run build-storybook` — completes without error.
- `npm run test` and `npm run build` — still green (unchanged from Task 01).

**Fallback if `@storybook/nextjs-vite` misbehaves on Next 16** (e.g. a
Vite/plugin resolution error): switch the framework to the webpack builder
`@storybook/nextjs@10.5.3` (same `^16.0.0` Next peer range), drop `vite`, set
`framework: "@storybook/nextjs"`. Slower builds but Babel-based and
battle-tested. Keep all `@storybook/*` at `10.5.3`.
