# Design tokens + theming foundation (the constitution)

## Description
Create the Design System's token layer and theming mechanism — the single
source of truth every future component will consume. This is **rules only**:
CSS custom properties (authored in global `.scss`, so they are still runtime
CSS variables and support live theme switching), a thin SCSS helper layer to
make the rules mechanically reusable, `next/font` wiring for the two
typefaces, a base/reset layer, the written non-negotiable constitution, and a
test that guarantees light/dark token parity. **No Storybook here** (Task 02),
**no UI components**, no page redesign.

Runtime theming requires CSS custom properties because Sass `$variables` are
compile-time and cannot switch light/dark at runtime. So tokens are authored
as `--custom-properties` inside global `.scss` partials. Investigation
confirmed Biome 2.5.5 does **not** parse `.scss` (treats it as unknown,
`ignoreUnknown: true` → skipped), so the token files are neither linted nor
line-capped nor reformatted by Biome — organize them for human readability
freely. The `.ts`/`.tsx` you touch (layout, the test) **are** linted and must
stay ≤100 lines and formatted.

### Concrete token spec (author exactly this structure; fill the ramp)

Author these as CSS custom properties. Primitives are raw values; semantic
tokens reference primitives and differ per theme.

**Color — primitives (theme-independent):**
```
violet: 300 #B5A3FF  400 #8B6BFF  500 #6C4CF1  600 #5433D6
lime:   300 #C6FF57  400 #B4E86D  500 #A3E635
green:  400 #3BE38A  500 #1FB86A
red:    400 #FF5A52  500 #F0453D
amber:  400 #FFB84D  500 #F5A524
cyan:   400 #4FD0FF  500 #2AB6E6
magenta:400 #FF5CBE  500 #F03DA6
ink ramp: 900 #0E0F14  800 #181A22  700 #242733  600 #3A3E4D
          500 #6B7180  400 #9AA0AE  300 #C7CBD4  200 #E4E6EC
          100 #F0F1F4  paper #F5F3EC  white #FFFFFF
```

**Color — semantic (light in `:root`, dark under `[data-theme="dark"]`):**
```
                       light            dark
--color-bg             paper #F5F3EC    ink-900 #0E0F14
--color-surface        white #FFFFFF    ink-800 #181A22
--color-surface-raised #FFFFFF          ink-700 #242733
--color-text           ink-900          #EDEDF2
--color-text-muted     ink-500          ink-400 #9AA0AE
--color-border         ink-900          ink-600 #3A3E4D
--color-border-subtle  ink-200 #E4E6EC  ink-700 #242733
--color-brand          violet-500       violet-400
--color-accent         lime-400         lime-300
--color-positive       green-500        green-400
--color-negative       red-500          red-400
--color-caution        amber-500        amber-400
--color-info           cyan-500         cyan-400
--color-focus          violet-500       violet-400
--gradient-sunset      linear-gradient(100deg, var(--color-brand), <magenta> 55%, var(--color-caution))
--gradient-toxic       linear-gradient(100deg, var(--color-accent), var(--color-brand))
```

**Typography:**
```
--font-display : var from next/font Press Start 2P   (SHORT display/eyebrow only)
--font-mono    : var from next/font JetBrains Mono   (all UI + numbers)
size scale (rem): --text-2xs .625 | --text-xs .75 | --text-sm .8125 |
                  --text-base .875 | --text-md 1 | --text-lg 1.25 |
                  --text-xl 1.5 | --text-2xl 2 | --text-3xl 2.75 | --text-display 4
weights: --weight-regular 400 | --weight-medium 500 | --weight-bold 700
line-height: --leading-tight 1.1 | --leading-snug 1.3 | --leading-normal 1.5
letter-spacing: --tracking-display .06em | --tracking-normal 0 | --tracking-wide .08em
```
Note: `Press Start 2P` renders large per-em and only ships weight 400 — reserve
`--text-display`/`--font-display` for short titles/eyebrows; never body, never
long numbers. Money uses `--font-mono` with `font-variant-numeric: tabular-nums`.

**Spacing — closed 4px grid** (only these; no ad-hoc values):
```
--space-1 4px  --space-2 8  --space-3 12  --space-4 16  --space-5 20
--space-6 24   --space-8 32 --space-10 40 --space-12 48 --space-16 64
--space-20 80  --space-24 96
```

**Radius** (capped at 6px):
```
--radius-0 0  --radius-sm 2px  --radius-md 4px  --radius-lg 6px
--radius-full 9999px   /* DOCUMENTED EXCEPTION: avatars / status dots ONLY */
```

**Border widths:** `--border-1 1px  --border-2 2px  --border-3 3px`.

**Elevation** (angular-contained: border-first; blur allowed only on floating
layers):
```
--elevation-flat    none                     /* border + surface tier define it */
--elevation-raised  0 1px 0 var(--color-border-subtle)   /* hairline lift */
--elevation-overlay light: 0 8px 24px -8px rgba(14,15,20,.25)
                    dark : 0 8px 24px -8px rgba(0,0,0,.6)   /* menu/popover/modal/toast */
```
No hard offset shadows anywhere (the neo-brutalist option was declined).

**Motion:**
```
--duration-fast 80ms  --duration-base 140ms  --duration-slow 240ms
--ease-snappy cubic-bezier(.2,0,0,1)
--ease-step steps(4, end)   /* optional 8-bit flavor for specific micro-interactions */
```
Under `@media (prefers-reduced-motion: reduce)`, collapse durations to `0ms`.

**Z-index:** `--z-base 0  --z-dropdown 1000  --z-sticky 1100  --z-overlay 1200
--z-modal 1300  --z-toast 1400`.

**Breakpoints** (Sass compile-time, for the mixin — NOT CSS vars):
`sm 480px  md 768px  lg 1024px  xl 1280px`.

**Focus ring** (non-negotiable, ≥3:1 contrast, always visible):
`outline: var(--border-2) solid var(--color-focus); outline-offset: 2px;`

## When to run
- Depends on: none
- Parallel-safe with: none (Task 02 depends on this)

## How-to

**Files to create (all under `src/styles/`):**
- `_tokens.scss` — the CSS custom properties above. Split into readable
  sections (primitives → semantic light `:root` → `[data-theme="dark"]`
  overrides → default-dark via `@media (prefers-color-scheme: dark)` when
  `:root:not([data-theme="light"])`). Since Biome ignores `.scss`, you may
  keep this in one file or split into `_color.scss`, `_type.scss`,
  `_space.scss` partials aggregated by the entry — optimize for readability,
  not for a line cap. This partial **emits** the `:root`/theme CSS.
- `_theme.scss` — the thin helper layer, **definitions only (emits no CSS)**:
  at minimum `@mixin bp($name)` (media query from the breakpoint map),
  `@mixin focus-ring`, `@mixin elevation($level)`, and a token accessor (e.g.
  `@function token($name) { @return var(--#{$name}); }` or a `space()`/
  `color()` helper). Components will `@use 'theme' as t;`.
- `_base.scss` — reset (fold in the current `box-sizing: border-box` from
  `src/app/globals.css`) + apply base to `html/body`: `background:
  var(--color-bg); color: var(--color-text); font-family: var(--font-mono);`
  set `color-scheme: light dark;` and smooth theme transitions (respecting
  reduced-motion).
- `globals.scss` — the single global entry: `@use 'tokens'; @use 'base';`
  (helpers are `@use`d by components, not here). Import this **once** in the
  root layout, replacing the `./globals.css` import; then delete
  `src/app/globals.css`.
- `README.md` — the **DS constitution** (see below).

**Fonts (`next/font/google`):** in `src/app/layout.tsx` (keep it ≤100 lines,
formatted), load `Press_Start_2P` (weight `"400"`, `subsets: ["latin"]`,
`variable: "--font-display"`) and `JetBrains_Mono` (`subsets: ["latin"]`,
`variable: "--font-mono"`), and add both `.variable` classNames to `<html>`.
`_tokens.scss` then reads `--font-display` / `--font-mono` (with sensible
`monospace`/`sans-serif` fallbacks in the token). Set `<html lang>` and, if
you want a hard default theme, `data-theme` may be left off so
`prefers-color-scheme` decides.

**Sass loadPaths:** add to `next.config.ts`:
`sassOptions: { loadPaths: ["src/styles"] }` so `@use 'tokens'` / `@use
'theme'` resolve from any component. (Task 02 verifies Storybook inherits
this; if it doesn't, Task 02 adds the equivalent to the Vite config.)

**Base import location:** Next.js only allows global (non-module) stylesheet
imports from the root layout — put `import "@/styles/globals.scss";` (or the
relative path) in `src/app/layout.tsx`.

**The constitution (`src/styles/README.md`)** — write the non-negotiable
rules explicitly, e.g.:
- Never hardcode a color/space/radius/shadow/duration — always a token.
- Radius never exceeds `--radius-lg` (6px); `--radius-full` is avatars/dots
  only.
- Elevation: border + surface tier first; blur-shadow only on floating
  layers; **no** offset/hard shadows.
- `--font-display` (Press Start 2P) is for short display/eyebrow text only;
  everything else is `--font-mono`; money is mono + `tabular-nums`.
- Spacing comes only from the 4px scale.
- Every semantic token must exist in both themes.
- Accessibility (non-negotiable): visible focus ring on every interactive
  element; text contrast ≥4.5:1 (≥3:1 large); never encode meaning by color
  alone (money pairs color with sign/▲▼); honor `prefers-reduced-motion`;
  future interactive hit-targets ≥44px.

**Test (`src/styles/tokens.test.ts`, Vitest, colocated):** read `_tokens.scss`
(and any color/theme partials) as text and assert:
1. every `--color-*`/gradient semantic token declared under `:root` is also
   declared under `[data-theme="dark"]` (parity — the core guard), and
2. a required-names allowlist (the semantic tokens listed above) is all
   present. Regex over `--([\w-]+):` within each selector block is enough — no
   Sass compilation needed. Keep it ≤100 lines / functions ≤100 lines.

**Docs to update** (both are Biome-ignored markdown, no cap):
- `.squad/ARCHITECTURE.md` — add a "Design System / styling tokens" note under
  the frontend section: tokens live in `src/styles/*.scss` as CSS custom
  properties (single source of truth, runtime-themeable via `data-theme`);
  `.module.scss` consume them via `@use 'theme'` + `var(--token)`; never
  hardcode; link `src/styles/README.md`.
- `CLAUDE.md` — one-line pointer to the DS constitution; leave a Commands note
  that Storybook scripts arrive in Task 02 (or add them there).

**Verification (run all, must be green):**
- `npm run lint` — Biome. Expect green. Note: the "max 100 lines" rule is
  `info`-severity (advisory) and never fires on `.scss`/`.mdx`; it only
  advises on `.css`/`.ts`. Keep the `.ts`/`.tsx` you touch tidy anyway.
- `npm run test` — Vitest; the new parity test passes alongside the existing
  health test.
- `npm run build` — `next build` must compile the global Sass + `next/font`
  without error.
- Manual sanity: `npm run dev`, load `/`, confirm the page picks up the mono
  font + token background, and toggling `<html data-theme="dark">` in devtools
  flips the theme.
