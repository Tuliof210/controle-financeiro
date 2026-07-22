# Form primitives — Button, TextField, MonthPicker, ColorPicker

## Description
Build the four remaining shared DS components the settings screen composes
(the fifth, `MoneyInput`, is task 03). All promoted to `src/components/`
because the screen's sections consume them from multiple places:

- **`Button`** — angular DS button with `variant` (`primary` | `ghost` |
  `danger`) and standard `<button>` passthrough props.
- **`TextField`** — labeled single-line text input (person name, goal name).
- **`MonthPicker`** — custom **mês + ano** selector emitting a `YYYYMM`
  integer. Used twice in the Range section (Início / Fim). Not a native
  `<input type="month">`, not a slider.
- **`ColorPicker`** — a row of DS-palette swatches; pick one for a Pessoa.

## When to run
- Depends on: none (but shares `src/lib/palette.ts` with task 02 — see below)
- Parallel-safe with: everything

## How-to
Each is a three-file `src/components/<Name>/` folder per
`.squad/ARCHITECTURE.md` (`index.tsx` renders `hook.ts`; tokens only via
`@use "theme" as t;`). Reference `NavItem`/`ThemeToggle` for the shape. All
must have a visible focus ring (`@include t.focus-ring;`), 44px min hit
targets, work in both themes, and hardcode nothing.

### `Button`
- `hook.ts`: props `{ variant?: "primary" | "ghost" | "danger" } &
  React.ButtonHTMLAttributes<HTMLButtonElement>`; returns the resolved
  className + passthrough props.
- `style.module.scss`: base = mono font, `--border-2` solid `--color-border`,
  `--radius-md`, `--space-2`/`--space-4` padding, `--duration-fast` transition.
  `primary` → `--color-brand` bg on `--white`-ish text; `danger` →
  `--color-negative`; `ghost` → transparent bg + border. Hover uses a surface
  tier / token, never an inline style (per learnings: never mix `:hover` with
  inline styles on the same prop).

### `TextField`
- `hook.ts`: props `{ label: string; value: string; onChange: (v: string) =>
  void; id: string; placeholder?; error?: string; maxLength? }`.
- `index.tsx`: `<label htmlFor>` (display/eyebrow-safe — label text is short,
  fine in mono), `<input type="text">`, and an optional error line
  (`--color-negative`, with a `▲`/text cue — never color-only, per README).
- `style.module.scss`: matches `MoneyInput`'s field look (surface bg,
  `--border-2`, `--radius-md`, focus ring on `:focus-within`) for visual
  consistency across the form.

### `MonthPicker`
- `hook.ts`: props `{ label: string; value: number | null; onChange:
  (yyyymm: number) => void; id: string }`. Internally split `value` into
  `{ year, month }` (`month = value % 100`, `year = Math.trunc(value / 100)`);
  compose back as `year * 100 + month` on change. Build the year option list
  from `new Date().getFullYear()` (fine in app runtime — only Workflow
  scripts forbid `Date`): range `currentYear - 3 … currentYear + 8`. Month
  options: `1..12` labeled `["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago",
  "Set","Out","Nov","Dez"]`. If `value` is null, default the selects to the
  current month/year but only fire `onChange` once the user actually picks
  (or seed both selects and emit the current YYYYMM on mount — pick one and
  keep it consistent; seeding-and-emitting is simpler for the Range section).
- `index.tsx`: two styled `<select>` (mês, ano) side by side under the label.
- `style.module.scss`: DS-styled selects — surface bg, `--border-2`
  `--color-border`, `--radius-md`, mono font, focus ring. Custom caret via a
  token-colored background is fine; keep it angular.
- Keep the mês labels + helpers in a tiny `month.helper.ts` if `hook.ts`
  risks the 100-line cap.

### `ColorPicker`
- Import `PALETTE` from `src/lib/palette.ts` (created in task 02; if task 04
  lands first in a worktree, create that one-line module here:
  `export const PALETTE = ["violet","lime","magenta","green","red","amber","cyan"] as const;`
  — tasks 02 and 04 both import it, so whichever runs first authors it).
- `hook.ts`: props `{ value: string; onChange: (key: string) => void }`.
- `index.tsx`: a `role="radiogroup"` of swatch buttons, one per palette key,
  each `aria-label` = the color name, `aria-checked` for the selected one,
  keyboard-focusable.
- `style.module.scss`: each swatch is a square (`--radius-md`, NOT
  `--radius-full` — that's avatars/dots only per README) filled with the
  matching primitive token. Map key → token via a class per key
  (`.violet { background: var(--violet-400); }` …) — do **not** interpolate
  `var(--#{$key}-400)` blindly; list them explicitly so it's greppable and
  the `-400` tier is intentional. Selected swatch gets a thick
  `--color-border` ring; focus ring on keyboard focus.

All files under 100 lines. No `*.test.ts` required here (presentational; the
tested logic is `MoneyInput`'s helpers and `MonthPicker`'s YYYYMM math — add a
tiny `month.helper.test.ts` for the split/compose if you extract the helper,
otherwise these are trivial enough to skip per the repo's testing scope).

## Verification
- `npm run lint` — Biome all-green (no file > 100 lines).
- `npm run build` — components compile.
- Once composed in task 05 (or a scratch page): Button variants render
  distinctly and show a focus ring; TextField accepts input; MonthPicker's two
  selects produce the right `YYYYMM`; ColorPicker selects one swatch and is
  keyboard-navigable — verified in both light and dark via the header theme
  toggle.
